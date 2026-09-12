// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
contract DemoAction {
    event ActionSucceeded(address indexed sender, bytes32 indexed intent);
    error DemoFailure(bytes32 intent);

    function succeed(bytes32 intent) external {
        emit ActionSucceeded(msg.sender, intent);
    }

    /// @notice Deliberately fails so the demo can produce an authentic reverted receipt.
    function fail(bytes32 intent) external pure {
        revert DemoFailure(intent);
    }
}
