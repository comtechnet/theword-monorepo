import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Block } from '@ethersproject/abstract-provider';
import {
  TheWordDescriptor,
  TheWordDescriptor__factory as TheWordDescriptorFactory,
  TheWordToken,
  TheWordToken__factory as TheWordTokenFactory,
  TheWordSeeder,
  TheWordSeeder__factory as TheWordSeederFactory,
  Weth,
  Weth__factory as WethFactory,
} from '../typechain';
import ImageData from '../files/image-data.json';
import { chunkArray } from '../utils';

export type TestSigners = {
  deployer: SignerWithAddress;
  account0: SignerWithAddress;
  account1: SignerWithAddress;
  account2: SignerWithAddress;
};

export const getSigners = async (): Promise<TestSigners> => {
  const [deployer, account0, account1, account2] = await ethers.getSigners();
  return {
    deployer,
    account0,
    account1,
    account2,
  };
};

export const deployTheWordDescriptor = async (
  deployer?: SignerWithAddress,
): Promise<TheWordDescriptor> => {
  const signer = deployer || (await getSigners()).deployer;
  const nftDescriptorLibraryFactory = await ethers.getContractFactory('NFTDescriptor', signer);
  const nftDescriptorLibrary = await nftDescriptorLibraryFactory.deploy();
  const thewordDescriptorFactory = new TheWordDescriptorFactory(
    {
      __$e1d8844a0810dc0e87a665b1f2b5fa7c69$__: nftDescriptorLibrary.address,
    },
    signer,
  );

  return thewordDescriptorFactory.deploy();
};

export const deploythewordSeeder = async (deployer?: SignerWithAddress): Promise<TheWordSeeder> => {
  const factory = new TheWordSeederFactory(deployer || (await getSigners()).deployer);

  return factory.deploy();
};

export const deployTheWordToken = async (
  deployer?: SignerWithAddress,
  theworddersDAO?: string,
  minter?: string,
  descriptor?: string,
  seeder?: string,
  proxyRegistryAddress?: string,
): Promise<TheWordToken> => {
  const signer = deployer || (await getSigners()).deployer;
  const factory = new TheWordTokenFactory(signer);

  return factory.deploy(
    theworddersDAO || signer.address,
    minter || signer.address,
    descriptor || (await deployTheWordDescriptor(signer)).address,
    seeder || (await deploythewordSeeder(signer)).address,
    proxyRegistryAddress || address(0),
  );
};

export const deployWeth = async (deployer?: SignerWithAddress): Promise<Weth> => {
  const factory = new WethFactory(deployer || (await await getSigners()).deployer);

  return factory.deploy();
};

export const populateDescriptor = async (thewordDescriptor: TheWordDescriptor): Promise<void> => {
  const { bgcolors, palette, images } = ImageData;
  const { bodies, accessories, heads, glasses } = images;

  // Split up head and accessory population due to high gas usage
  await Promise.all([
    thewordDescriptor.addManyBackgrounds(bgcolors),
    thewordDescriptor.addManyColorsToPalette(0, palette),
    thewordDescriptor.addManyBodies(bodies.map(({ data }) => data)),
    chunkArray(accessories, 10).map(chunk =>
      thewordDescriptor.addManyAccessories(chunk.map(({ data }) => data)),
    ),
    chunkArray(heads, 10).map(chunk =>
      thewordDescriptor.addManyHeads(chunk.map(({ data }) => data)),
    ),
    thewordDescriptor.addManyGlasses(glasses.map(({ data }) => data)),
  ]);
};

/**
 * Return a function used to mint `amount` theword on the provided `token`
 * @param token The theword ERC721 token
 * @param amount The number of theword to mint
 */
export const MintTheWord =
  (token: TheWordToken, burnTheWorddersTokens = true): ((amount: number) => Promise<void>) =>
  async (amount: number): Promise<void> => {
    for (let i = 0; i < amount; i++) {
      await token.mint();
    }
    if (!burnTheWorddersTokens) return;

    await setTotalSupply(token, amount);
  };

/**
 * Mints or burns tokens to target a total supply. Due to TheWordders' rewards tokens may be burned and tokenIds will not be sequential
 */
export const setTotalSupply = async (
  token: TheWordToken,
  newTotalSupply: number,
): Promise<void> => {
  const totalSupply = (await token.totalSupply()).toNumber();

  if (totalSupply < newTotalSupply) {
    for (let i = 0; i < newTotalSupply - totalSupply; i++) {
      await token.mint();
    }
    // If TheWordder's reward tokens were minted totalSupply will be more than expected, so run setTotalSupply again to burn extra tokens
    await setTotalSupply(token, newTotalSupply);
  }

  if (totalSupply > newTotalSupply) {
    for (let i = newTotalSupply; i < totalSupply; i++) {
      await token.burn(i);
    }
  }
};

// The following adapted from `https://github.com/compound-finance/compound-protocol/blob/master/tests/Utils/Ethereum.js`

const rpc = <T = unknown>({ method, params }: { method: string; params?: unknown[] }): Promise<T> =>
  network.provider.send(method, params);

export const encodeParameters = (types: string[], values: unknown[]): string => {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
};

export const blockByNumber = async (n: number | string): Promise<Block> =>
  rpc({ method: 'eth_getBlockByNumber', params: [n, false] });

export const increaseTime = async (seconds: number): Promise<unknown> => {
  await rpc({ method: 'evm_increaseTime', params: [seconds] });
  return rpc({ method: 'evm_mine' });
};

export const freezeTime = async (seconds: number): Promise<unknown> => {
  await rpc({ method: 'evm_increaseTime', params: [-1 * seconds] });
  return rpc({ method: 'evm_mine' });
};

export const advanceBlocks = async (blocks: number): Promise<void> => {
  for (let i = 0; i < blocks; i++) {
    await mineBlock();
  }
};

export const blockNumber = async (parse = true): Promise<number> => {
  const result = await rpc<number>({ method: 'eth_blockNumber' });
  return parse ? parseInt(result.toString()) : result;
};

export const blockTimestamp = async (
  n: number | string,
  parse = true,
): Promise<number | string> => {
  const block = await blockByNumber(n);
  return parse ? parseInt(block.timestamp.toString()) : block.timestamp;
};

export const setNextBlockTimestamp = async (n: number, mine = true): Promise<void> => {
  await rpc({ method: 'evm_setNextBlockTimestamp', params: [n] });
  if (mine) await mineBlock();
};

export const minerStop = async (): Promise<void> => {
  await network.provider.send('evm_setAutomine', [false]);
  await network.provider.send('evm_setIntervalMining', [0]);
};

export const minerStart = async (): Promise<void> => {
  await network.provider.send('evm_setAutomine', [true]);
};

export const mineBlock = async (): Promise<void> => {
  await network.provider.send('evm_mine');
};

export const chainId = async (): Promise<number> =>
  parseInt(await network.provider.send('eth_chainId'), 16);

export const address = (n: number): string => `0x${n.toString(16).padStart(40, '0')}`;
