import { Contract, providers } from 'ethers';
import { NFTStorage } from 'nft.storage';
import { TheWordTokenABI } from '@theword/contracts';
import Redis from 'ioredis';
import { config } from './config';

/**
 * IFPS Storage Client
 */
export const storage = new NFTStorage({ token: config.nftStorageApiKey });

/**
 * Redis Client
 */
export const redis = new Redis(config.redisPort, config.redisHost);

/**
 * Ethers JSON RPC Provider
 */
export const jsonRpcProvider = new providers.JsonRpcProvider(config.jsonRpcUrl);

/**
 * theword ERC721 Token Contract
 */
export const thewordTokenContract = new Contract(
  config.thewordTokenAddress,
  TheWordTokenABI,
  jsonRpcProvider,
);
