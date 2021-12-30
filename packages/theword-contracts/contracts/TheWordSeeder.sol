// SPDX-License-Identifier: GPL-3.0

/// @title The thewordToken pseudo-random seed generator

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

import { ITheWordSeeder } from './interfaces/ITheWordSeeder.sol';
import { ITheWordDescriptor } from './interfaces/ITheWordDescriptor.sol';

contract TheWordSeeder is ITheWordSeeder {
    /**
     * @notice Generate a pseudo-random TheWord seed using the previous blockhash and theword ID.
     */
    // prettier-ignore
    function generateSeed(uint256 thewordId, ITheWordDescriptor descriptor) external view override returns (Seed memory) {
        uint256 pseudorandomness = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), thewordId))
        );

        uint256 backgroundCount = descriptor.backgroundCount();
        uint256 bodyCount = descriptor.bodyCount();
        uint256 accessoryCount = descriptor.accessoryCount();
        uint256 headCount = descriptor.headCount();
        uint256 glassesCount = descriptor.glassesCount();

        return Seed({
            background: uint48(
                uint48(pseudorandomness) % backgroundCount
            ),
            body: uint48(
                uint48(pseudorandomness >> 48) % bodyCount
            ),
            accessory: uint48(
                uint48(pseudorandomness >> 96) % accessoryCount
            ),
            head: uint48(
                uint48(pseudorandomness >> 144) % headCount
            ),
            glasses: uint48(
                uint48(pseudorandomness >> 192) % glassesCount
            )
        });
    }
}
