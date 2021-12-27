import { expect } from 'chai';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import {
  shiftRightAndCast,
  getPseudorandomPart,
  getthewordeedFromBlockHash,
  getTheWordData,
} from '../src/index';
import { images } from '../src/image-data.json';
import { thewordeed } from '../src/types';

const { bodies, accessories, heads, glasses } = images;

describe('@theword/assets utils', () => {
  // Test against TheWord 116, created at block 13661786
  const THEWORD116_ID = 116;
  const THEWORD116_SEED: thewordeed = {
    background: 1,
    body: 28,
    accessory: 120,
    head: 95,
    glasses: 15,
  };
  const THEWORD116_PREV_BLOCKHASH =
    '0x5014101691e81d79a2eba711e698118e1a90c9be7acb2f40d7f200134ee53e01';
  const THEWORD116_PSEUDORANDOMNESS = solidityKeccak256(
    ['bytes32', 'uint256'],
    [THEWORD116_PREV_BLOCKHASH, THEWORD116_ID],
  );

  describe('shiftRightAndCast', () => {
    it('should work correctly', () => {
      expect(shiftRightAndCast(THEWORD116_PREV_BLOCKHASH, 0, 48)).to.equal('0x00134ee53e01');
      expect(shiftRightAndCast(THEWORD116_PREV_BLOCKHASH, 48, 48)).to.equal('0x7acb2f40d7f2');
    });
  });

  describe('getPseudorandomPart', () => {
    it('should match thewordSeeder.sol implementation for a pseudorandomly chosen part', () => {
      const headShift = 144;
      const { head } = THEWORD116_SEED;
      expect(getPseudorandomPart(THEWORD116_PSEUDORANDOMNESS, heads.length, headShift)).to.be.equal(
        head,
      );
    });
  });

  describe('getthewordeedFromBlockHash', () => {
    it('should match thewordSeeder.sol implementation for generating a TheWord seed', () => {
      expect(getthewordeedFromBlockHash(THEWORD116_ID, THEWORD116_PREV_BLOCKHASH)).to.deep.equal(
        THEWORD116_SEED,
      );
    });
  });
});
