import {
  TheWordTokenFactory,
  TheWordOfferingHouseFactory,
  TheWordDescriptorFactory,
  TheWordSeederFactory,
  TheWordDaoLogicV1Factory,
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
    thewordTokenContract: TheWordTokenFactory.connect(
      addresses.thewordToken,
      signerOrProvider as Signer | Provider,
    ),
    thewordOfferingHouseContract: TheWordOfferingHouseFactory.connect(
      addresses.thewordOfferingHouseProxy,
      signerOrProvider as Signer | Provider,
    ),
    thewordDescriptorContract: TheWordDescriptorFactory.connect(
      addresses.thewordDescriptor,
      signerOrProvider as Signer | Provider,
    ),
    thewordSeederContract: TheWordSeederFactory.connect(
      addresses.thewordSeeder,
      signerOrProvider as Signer | Provider,
    ),
    thewordDaoContract: TheWordDaoLogicV1Factory.connect(
      addresses.thewordDAOProxy,
      signerOrProvider as Signer | Provider,
    ),
  };
};
