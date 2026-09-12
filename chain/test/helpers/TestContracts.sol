// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/INativeQueryVerifier.sol";

/// Test-only substitute for the chain-native proof verifier, installed with local setCode.
/// This authenticates the entire supplied tuple. It is not a cryptographic proof verifier.
contract VerifierHarness is INativeQueryVerifier {
    mapping(bytes32 => bool) public allowed;
    bool public revertAll;
    function authorize(bytes32 digest) external { allowed[digest] = true; }
    function setRevert(bool value) external { revertAll = value; }
    function verify(uint64 chainKey, uint64 height, bytes calldata encodedTransaction,
        MerkleProof calldata merkleProof, ContinuityProof calldata continuityProof
    ) external view returns (bool) {
        require(!revertAll, "native verifier rejected");
        return allowed[keccak256(abi.encode(chainKey, height, encodedTransaction, merkleProof, continuityProof))];
    }
}

contract PaymentRecipient {
    address public vault;
    bytes public reentry;
    bool public reject;
    bool public nestedSucceeded;
    uint256 public received;
    function configure(address vault_, bytes calldata reentry_, bool reject_) external {
        vault = vault_; reentry = reentry_; reject = reject_;
    }
    receive() external payable {
        require(!reject, "recipient rejected");
        received += msg.value;
        if (reentry.length != 0) (nestedSucceeded,) = vault.call(reentry);
    }
}
