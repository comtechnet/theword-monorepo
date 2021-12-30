// SPDX-License-Identifier: GPL-3.0

/// @title The TheWord DAO offering house

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

// LICENSE
// thewordOfferingHouse.sol is a modified version of Zora's OfferingHouse.sol:
// https://github.com/ourzora/offering-house/blob/54a12ec1a6cf562e49f0a4917990474b11350a2d/contracts/OfferingHouse.sol
//
// OfferingHouse.sol source code Copyright Zora licensed under the GPL-3.0 license.
// With modifications by TheWordders DAO.

pragma solidity ^0.8.6;

import { PausableUpgradeable } from '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import { ReentrancyGuardUpgradeable } from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { ITheWordOfferingHouse } from './interfaces/ITheWordOfferingHouse.sol';
import { ITheWordToken } from './interfaces/ITheWordToken.sol';
import { IWETH } from './interfaces/IWETH.sol';

contract TheWordOfferingHouse is ITheWordOfferingHouse, PausableUpgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    // The theword ERC721 token contract
    ITheWordToken public theword;

    // The address of the WETH contract
    address public weth;

    // The minimum amount of time left in an offering after a new bid is created
    uint256 public timeBuffer;

    // The minimum price accepted in an offering
    uint256 public reservePrice;

    // The minimum percentage difference between the last bid amount and the current bid
    uint8 public minBidIncrementPercentage;

    // The duration of a single offering
    uint256 public duration;

    // The active offering
    ITheWordOfferingHouse.Offering public offering;

    /**
     * @notice Initialize the offering house and base contracts,
     * populate configuration values, and pause the contract.
     * @dev This function can only be called once.
     */
    function initialize(
        ITheWordToken _theword,
        address _weth,
        uint256 _timeBuffer,
        uint256 _reservePrice,
        uint8 _minBidIncrementPercentage,
        uint256 _duration
    ) external initializer {
        __Pausable_init();
        __ReentrancyGuard_init();
        __Ownable_init();

        _pause();

        theword = _theword;
        weth = _weth;
        timeBuffer = _timeBuffer;
        reservePrice = _reservePrice;
        minBidIncrementPercentage = _minBidIncrementPercentage;
        duration = _duration;
    }

    /**
     * @notice Settle the current offering, mint a new TheWord, and put it up for offering.
     */
    function settleCurrentAndCreateNewOffering() external override nonReentrant whenNotPaused {
        _settleOffering();
        _createOffering();
    }

    /**
     * @notice Settle the current offering.
     * @dev This function can only be called when the contract is paused.
     */
    function settleOffering() external override whenPaused nonReentrant {
        _settleOffering();
    }

    /**
     * @notice Create a bid for a TheWord, with a given amount.
     * @dev This contract only accepts payment in ETH.
     */
    function createBid(uint256 thewordId) external payable override nonReentrant {
        ITheWordOfferingHouse.Offering memory _offering = offering;

        require(_offering.thewordId == thewordId, 'TheWord not up for offering');
        require(block.timestamp < _offering.endTime, 'Offering expired');
        require(msg.value >= reservePrice, 'Must send at least reservePrice');
        require(
            msg.value >= _offering.amount + ((_offering.amount * minBidIncrementPercentage) / 100),
            'Must send more than last bid by minBidIncrementPercentage amount'
        );

        address payable lastBidder = _offering.bidder;

        // Refund the last bidder, if applicable
        if (lastBidder != address(0)) {
            _safeTransferETHWithFallback(lastBidder, _offering.amount);
        }

        offering.amount = msg.value;
        offering.bidder = payable(msg.sender);

        // Extend the offering if the bid was received within `timeBuffer` of the offering end time
        bool extended = _offering.endTime - block.timestamp < timeBuffer;
        if (extended) {
            offering.endTime = _offering.endTime = block.timestamp + timeBuffer;
        }

        emit OfferingBid(_offering.thewordId, msg.sender, msg.value, extended);

        if (extended) {
            emit OfferingExtended(_offering.thewordId, _offering.endTime);
        }
    }

    /**
     * @notice Pause the theword offering house.
     * @dev This function can only be called by the owner when the
     * contract is unpaused. While no new offerings can be started when paused,
     * anyone can settle an ongoing offering.
     */
    function pause() external override onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the theword offering house.
     * @dev This function can only be called by the owner when the
     * contract is paused. If required, this function will start a new offering.
     */
    function unpause() external override onlyOwner {
        _unpause();

        if (offering.startTime == 0 || offering.settled) {
            _createOffering();
        }
    }

    /**
     * @notice Set the offering time buffer.
     * @dev Only callable by the owner.
     */
    function setTimeBuffer(uint256 _timeBuffer) external override onlyOwner {
        timeBuffer = _timeBuffer;

        emit OfferingTimeBufferUpdated(_timeBuffer);
    }

    /**
     * @notice Set the offering reserve price.
     * @dev Only callable by the owner.
     */
    function setReservePrice(uint256 _reservePrice) external override onlyOwner {
        reservePrice = _reservePrice;

        emit OfferingReservePriceUpdated(_reservePrice);
    }

    /**
     * @notice Set the offering minimum bid increment percentage.
     * @dev Only callable by the owner.
     */
    function setMinBidIncrementPercentage(uint8 _minBidIncrementPercentage) external override onlyOwner {
        minBidIncrementPercentage = _minBidIncrementPercentage;

        emit OfferingMinBidIncrementPercentageUpdated(_minBidIncrementPercentage);
    }

    /**
     * @notice Create an offering.
     * @dev Store the offering details in the `offering` state variable and emit an OfferingCreated event.
     * If the mint reverts, the minter was updated without pausing this contract first. To remedy this,
     * catch the revert and pause this contract.
     */
    function _createOffering() internal {
        try theword.mint() returns (uint256 thewordId) {
            uint256 startTime = block.timestamp;
            uint256 endTime = startTime + duration;

            offering = Offering({
                thewordId: thewordId,
                amount: 0,
                startTime: startTime,
                endTime: endTime,
                bidder: payable(0),
                settled: false
            });

            emit OfferingCreated(thewordId, startTime, endTime);
        } catch Error(string memory) {
            _pause();
        }
    }

    /**
     * @notice Settle an offering, finalizing the bid and paying out to the owner.
     * @dev If there are no bids, the TheWord is burned.
     */
    function _settleOffering() internal {
        ITheWordOfferingHouse.Offering memory _offering = offering;

        require(_offering.startTime != 0, "Offering hasn't begun");
        require(!_offering.settled, 'Offering has already been settled');
        require(block.timestamp >= _offering.endTime, "Offering hasn't completed");

        offering.settled = true;

        if (_offering.bidder == address(0)) {
            theword.burn(_offering.thewordId);
        } else {
            theword.transferFrom(address(this), _offering.bidder, _offering.thewordId);
        }

        if (_offering.amount > 0) {
            _safeTransferETHWithFallback(owner(), _offering.amount);
        }

        emit OfferingSettled(_offering.thewordId, _offering.bidder, _offering.amount);
    }

    /**
     * @notice Transfer ETH. If the ETH transfer fails, wrap the ETH and try send it as WETH.
     */
    function _safeTransferETHWithFallback(address to, uint256 amount) internal {
        if (!_safeTransferETH(to, amount)) {
            IWETH(weth).deposit{ value: amount }();
            IERC20(weth).transfer(to, amount);
        }
    }

    /**
     * @notice Transfer ETH and return the success status.
     * @dev This function only forwards 30,000 gas to the callee.
     */
    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
        (bool success, ) = to.call{ value: value, gas: 30_000 }(new bytes(0));
        return success;
    }
}
