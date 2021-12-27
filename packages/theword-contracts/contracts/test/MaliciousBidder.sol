// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { IthewordAuctionHouse } from '../interfaces/IthewordAuctionHouse.sol';

contract MaliciousBidder {
    function bid(IthewordAuctionHouse auctionHouse, uint256 tokenId) public payable {
        auctionHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
