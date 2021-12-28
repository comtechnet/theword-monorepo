// SPDX-License-Identifier: GPL-3.0

/// @title Interface for thewordToken

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

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IthewordDescriptor } from './IthewordDescriptor.sol';
import { IthewordSeeder } from './IthewordSeeder.sol';

interface IthewordToken is IERC721 {
    event TheWordCreated(uint256 indexed tokenId, IthewordSeeder.Seed seed);

    event TheWordBurned(uint256 indexed tokenId);

    event TheWorddersDAOUpdated(address theworddersDAO);

    event MinterUpdated(address minter);

    event MinterLocked();

    event DescriptorUpdated(IthewordDescriptor descriptor);

    event DescriptorLocked();

    event SeederUpdated(IthewordSeeder seeder);

    event SeederLocked();

    function mint() external returns (uint256);

    function burn(uint256 tokenId) external;

    function dataURI(uint256 tokenId) external returns (string memory);

    function setTheWorddersDAO(address theworddersDAO) external;

    function setMinter(address minter) external;

    function lockMinter() external;

    function setDescriptor(IthewordDescriptor descriptor) external;

    function lockDescriptor() external;

    function setSeeder(IthewordSeeder seeder) external;

    function lockSeeder() external;
}
