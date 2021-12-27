// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import '../governance/thewordDAOLogicV1.sol';

contract thewordDAOImmutable is thewordDAOLogicV1 {
    constructor(
        address timelock_,
        address theword_,
        address admin_,
        address vetoer_,
        uint256 votingPeriod_,
        uint256 votingDelay_,
        uint256 proposalThresholdBPS_,
        uint256 quorumVotesBPS_
    ) {
        admin = msg.sender;
        initialize(timelock_, theword_, vetoer_, votingPeriod_, votingDelay_, proposalThresholdBPS_, quorumVotesBPS_);

        admin = admin_;
    }

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

        timelock = IthewordDAOExecutor(timelock_);
        theword = thewordTokenLike(theword_);
        vetoer = vetoer_;
        votingPeriod = votingPeriod_;
        votingDelay = votingDelay_;
        proposalThresholdBPS = proposalThresholdBPS_;
        quorumVotesBPS = quorumVotesBPS_;
    }
}
