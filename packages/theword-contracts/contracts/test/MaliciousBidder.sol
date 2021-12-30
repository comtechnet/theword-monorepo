// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { ITheWordOfferingHouse } from '../interfaces/ITheWordOfferingHouse.sol';

contract MaliciousBidder {
    function bid(ITheWordOfferingHouse offeringHouse, uint256 tokenId) public payable {
        offeringHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
