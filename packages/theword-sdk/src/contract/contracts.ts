import {
  thewordTokenFactory,
  thewordAuctionHouseFactory,
  thewordDescriptorFactory,
  thewordSeederFactory,
  thewordDaoLogicV1Factory,
} from '@theword/contracts';
import type { Signer } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import { getContractAddressesForChainOrThrow } from './addresses';
import { Contracts } from './types';

/**
 * Get contract instances that target the Ethereum mainnet
 * or a supported testnet. Throws if there are no known contracts
 * deployed on the corresponding chain.
 * @param chainId The desired chain id
 * @param signerOrProvider The ethers v5 signer or provider
 */
export const getContractsForChainOrThrow = (
  chainId: number,
  signerOrProvider?: Signer | Provider,
): Contracts => {
  const addresses = getContractAddressesForChainOrThrow(chainId);

  return {
    thewordTokenContract: thewordTokenFactory.connect(
      addresses.thewordToken,
      signerOrProvider as Signer | Provider,
    ),
    thewordAuctionHouseContract: thewordAuctionHouseFactory.connect(
      addresses.thewordAuctionHouseProxy,
      signerOrProvider as Signer | Provider,
    ),
    thewordDescriptorContract: thewordDescriptorFactory.connect(
      addresses.thewordDescriptor,
      signerOrProvider as Signer | Provider,
    ),
    thewordSeederContract: thewordSeederFactory.connect(
      addresses.thewordSeeder,
      signerOrProvider as Signer | Provider,
    ),
    thewordDaoContract: thewordDaoLogicV1Factory.connect(
      addresses.thewordDAOProxy,
      signerOrProvider as Signer | Provider,
    ),
  };
};
