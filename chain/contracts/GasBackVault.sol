// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/INativeQueryVerifier.sol";
import {EvmV1Decoder} from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";

/// @notice Sponsor-funded fixed rebates for preauthorized failed Sepolia transactions.
/// @dev Testnet MVP: only zero-value type-2 transactions; tickets do not reserve funds.
/// Proofs establish source transaction facts, not fault, innocence, or economic damages.
contract GasBackVault {
    struct Ticket {
        address beneficiary;
        address sourceSender;
        address sourceTarget;
        uint64 sourceNonce;
        uint64 minSourceBlock;
        uint64 maxSourceBlock;
        uint64 claimDeadline;
        uint64 minGasLimit;
        uint256 rebate;
        bytes32 calldataHash;
    }

    address public immutable owner;
    address public constant VERIFIER = 0x0000000000000000000000000000000000000FD2;
    uint64 public constant SOURCE_CHAIN_KEY = 1;
    uint64 public constant SOURCE_CHAIN_ID = 11155111;
    mapping(bytes32 => Ticket) public tickets;
    mapping(bytes32 => bool) public issued;
    mapping(bytes32 => bool) public claimed;
    mapping(bytes32 => bool) public spentTransactions;
    uint256 public totalPaid;
    bool private entering;

    error Unauthorized();
    error InvalidTicket();
    error TicketAlreadyIssued();
    error TicketNotIssued();
    error TicketAlreadyClaimed();
    error TicketExpired();
    error WrongSourceChain();
    error InvalidProof();
    error SourceBlockOutOfRange();
    error SourceDidNotFail();
    error SourceIntentMismatch();
    error SourceAlreadyConsumed();
    error InsufficientBudget();
    error PaymentFailed();
    error ReentrantClaim();

    event BudgetFunded(address indexed sponsor, uint256 amount);
    event TicketIssued(bytes32 indexed ticketId, address indexed beneficiary, uint256 rebate);
    event RebatePaid(bytes32 indexed ticketId, bytes32 indexed nullifier,
        address indexed beneficiary, uint256 amount, uint64 sourceBlock);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (entering) revert ReentrantClaim();
        entering = true;
        _;
        entering = false;
    }

    constructor() payable {
        owner = msg.sender;
        if (msg.value != 0) emit BudgetFunded(msg.sender, msg.value);
    }

    receive() external payable onlyOwner {
        emit BudgetFunded(msg.sender, msg.value);
    }

    /// @notice Authorizes a one-use policy. It can never be edited or reassigned.
    /// @dev Sponsor must set a source block range after authorization for prospective tickets.
    /// An issued ticket is not a guarantee that campaign funds will remain available.
    function issueTicket(bytes32 ticketId, Ticket calldata ticket) external onlyOwner {
        if (issued[ticketId]) revert TicketAlreadyIssued();
        if (
            ticket.beneficiary == address(0) || ticket.beneficiary != ticket.sourceSender ||
            ticket.sourceTarget == address(0) || ticket.rebate == 0 ||
            ticket.minGasLimit == 0 || ticket.minSourceBlock > ticket.maxSourceBlock ||
            ticket.claimDeadline <= block.timestamp
        ) revert InvalidTicket();
        tickets[ticketId] = ticket;
        issued[ticketId] = true;
        emit TicketIssued(ticketId, ticket.beneficiary, ticket.rebate);
    }

    /// @notice Anyone may relay a claim; funds always go to the stored beneficiary.
    /// @dev Never accepts a caller-supplied tx hash, receipt status, sender, or payout address.
    function claim(
        bytes32 ticketId,
        uint64 chainKey,
        uint64 headerNumber,
        bytes calldata encodedTransaction,
        INativeQueryVerifier.MerkleProof calldata merkleProof,
        INativeQueryVerifier.ContinuityProof calldata continuityProof
    ) external nonReentrant {
        if (!issued[ticketId]) revert TicketNotIssued();
        if (claimed[ticketId]) revert TicketAlreadyClaimed();
        Ticket memory ticket = tickets[ticketId];
        if (block.timestamp > ticket.claimDeadline) revert TicketExpired();
        if (chainKey != SOURCE_CHAIN_KEY) revert WrongSourceChain();

        // The native verifier binds BOTH the encoded payload and headerNumber.
        // A revert or false return fails closed, before any source fields are interpreted.
        if (!INativeQueryVerifier(VERIFIER).verify(
            chainKey, headerNumber, encodedTransaction, merkleProof, continuityProof
        )) revert InvalidProof();

        if (headerNumber < ticket.minSourceBlock || headerNumber > ticket.maxSourceBlock)
            revert SourceBlockOutOfRange();
        EvmV1Decoder.DecodedTransactionType2 memory source =
            EvmV1Decoder.decodeTransactionType2(encodedTransaction);
        if (source.type2.chainId != SOURCE_CHAIN_ID) revert WrongSourceChain();
        if (source.receipt.receiptStatus != 0) revert SourceDidNotFail();
        if (
            source.commonTx.from != ticket.sourceSender ||
            source.commonTx.toIsNull || source.commonTx.to != ticket.sourceTarget ||
            source.commonTx.nonce != ticket.sourceNonce || source.commonTx.value != 0 ||
            source.commonTx.gasLimit < ticket.minGasLimit ||
            keccak256(source.commonTx.data) != ticket.calldataHash
        ) revert SourceIntentMismatch();

        // Source identity survives alternate proof paths and duplicate ticket issuance.
        bytes32 nullifier = keccak256(abi.encode(chainKey, source.commonTx.from, source.commonTx.nonce));
        if (spentTransactions[nullifier]) revert SourceAlreadyConsumed();
        if (address(this).balance < ticket.rebate) revert InsufficientBudget();

        // Atomic effects-before-interaction. A rejected payment reverts every state change.
        claimed[ticketId] = true;
        spentTransactions[nullifier] = true;
        totalPaid += ticket.rebate;
        (bool paid,) = payable(ticket.beneficiary).call{value: ticket.rebate}("");
        if (!paid) revert PaymentFailed();
        emit RebatePaid(ticketId, nullifier, ticket.beneficiary, ticket.rebate, headerNumber);
    }
}
