// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import '../governance/TheWordDAOLogicV1.sol';

contract TheWordDAOLogicV1Harness is TheWordDAOLogicV1 {
    function initialize(
        address timelock_,
        address theword_,
        address vetoer_,
        uint256 votingPeriod_,
        uint256 votingDelay_,
        uint256 proposalThresholdBPS_,
        uint256 quorumVotesBPS_
    ) public override {
        require(msg.sender == admin, 'thewordDAO::initialize: admin only');
        require(address(timelock) == address(0), 'thewordDAO::initialize: can only initialize once');

        timelock = ITheWordDAOExecutor(timelock_);
        theword = TheWordTokenLike(theword_);
        vetoer = vetoer_;
        votingPeriod = votingPeriod_;
        votingDelay = votingDelay_;
        proposalThresholdBPS = proposalThresholdBPS_;
        quorumVotesBPS = quorumVotesBPS_;
    }
}
