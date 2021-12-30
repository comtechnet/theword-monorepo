// SPDX-License-Identifier: GPL-3.0

/// @title Interface for TheWord Offering Houses

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.6;

interface ITheWordOfferingHouse {
    struct Offering {
        // ID for the TheWord (ERC721 token ID)
        uint256 thewordId;
        // The current highest bid amount
        uint256 amount;
        // The time that the offering started
        uint256 startTime;
        // The time that the offering is scheduled to end
        uint256 endTime;
        // The address of the current highest bid
        address payable bidder;
        // Whether or not the offering has been settled
        bool settled;
    }

    event OfferingCreated(uint256 indexed thewordId, uint256 startTime, uint256 endTime);

    event OfferingBid(uint256 indexed thewordId, address sender, uint256 value, bool extended);

    event OfferingExtended(uint256 indexed thewordId, uint256 endTime);

    event OfferingSettled(uint256 indexed thewordId, address winner, uint256 amount);

    event OfferingTimeBufferUpdated(uint256 timeBuffer);

    event OfferingReservePriceUpdated(uint256 reservePrice);

    event OfferingMinBidIncrementPercentageUpdated(uint256 minBidIncrementPercentage);

    function settleOffering() external;

    function settleCurrentAndCreateNewOffering() external;

    function createBid(uint256 thewordId) external payable;

    function pause() external;

    function unpause() external;

    function setTimeBuffer(uint256 timeBuffer) external;

    function setReservePrice(uint256 reservePrice) external;

    function setMinBidIncrementPercentage(uint8 minBidIncrementPercentage) external;
}
