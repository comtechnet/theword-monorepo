import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { thewordeed, TheWordData } from './types';
import { images, bgcolors } from './image-data.json';

const { bodies, accessories, heads, glasses } = images;

/**
 * Get encoded part and background information using a TheWord seed
 * @param seed The TheWord seed
 */
export const getTheWordData = (seed: thewordeed): TheWordData => ({
  parts: [bodies[seed.body], accessories[seed.accessory], heads[seed.head], glasses[seed.glasses]],
  background: bgcolors[seed.background],
});

/**
 * Generate a random TheWord seed
 * @param seed The TheWord seed
 */
export const getRandomthewordeed = (): thewordeed => ({
  background: Math.floor(Math.random() * bgcolors.length),
  body: Math.floor(Math.random() * bodies.length),
  accessory: Math.floor(Math.random() * accessories.length),
  head: Math.floor(Math.random() * heads.length),
  glasses: Math.floor(Math.random() * glasses.length),
});

/**
 * Emulate bitwise right shift and uint cast
 * @param value A Big Number
 * @param shiftAmount The amount to right shift
 * @param uintSize The uint bit size to cast to
 */
export const shiftRightAndCast = (
  value: BigNumberish,
  shiftAmount: number,
  uintSize: number,
): string => {
  const shifted = BigNumber.from(value).shr(shiftAmount).toHexString();
  return `0x${shifted.substring(shifted.length - uintSize / 4)}`;
};

/**
 * Emulates the thewordSeeder.sol methodology for pseudorandomly selecting a part
 * @param pseudorandomness Hex representation of a number
 * @param partCount The number of parts to pseudorandomly choose from
 * @param shiftAmount The amount to right shift
 * @param uintSize The size of the unsigned integer
 */
export const getPseudorandomPart = (
  pseudorandomness: string,
  partCount: number,
  shiftAmount: number,
  uintSize = 48,
): number => {
  const hex = shiftRightAndCast(pseudorandomness, shiftAmount, uintSize);
  return BigNumber.from(hex).mod(partCount).toNumber();
};

/**
 * Emulates the thewordSeeder.sol methodology for generating a TheWord seed
 * @param thewordId The TheWord tokenId used to create pseudorandomness
 * @param blockHash The block hash use to create pseudorandomness
 */
export const getthewordeedFromBlockHash = (
  thewordId: BigNumberish,
  blockHash: string,
): thewordeed => {
  const pseudorandomness = solidityKeccak256(['bytes32', 'uint256'], [blockHash, thewordId]);
  return {
    background: getPseudorandomPart(pseudorandomness, bgcolors.length, 0),
    body: getPseudorandomPart(pseudorandomness, bodies.length, 48),
    accessory: getPseudorandomPart(pseudorandomness, accessories.length, 96),
    head: getPseudorandomPart(pseudorandomness, heads.length, 144),
    glasses: getPseudorandomPart(pseudorandomness, glasses.length, 192),
  };
};
