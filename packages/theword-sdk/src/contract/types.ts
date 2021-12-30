import {
  TheWordTokenFactory,
  TheWordOfferingHouseFactory,
  TheWordDescriptorFactory,
  TheWordSeederFactory,
  TheWordDaoLogicV1Factory,
} from '@theword/contracts';

export interface ContractAddresses {
  thewordToken: string;
  thewordSeeder: string;
  thewordDescriptor: string;
  nftDescriptor: string;
  thewordOfferingHouse: string;
  thewordOfferingHouseProxy: string;
  thewordOfferingHouseProxyAdmin: string;
  thewordDaoExecutor: string;
  thewordDAOProxy: string;
  thewordDAOLogicV1: string;
}

export interface Contracts {
  thewordTokenContract: ReturnType<typeof TheWordTokenFactory.connect>;
  thewordOfferingHouseContract: ReturnType<typeof TheWordOfferingHouseFactory.connect>;
  thewordDescriptorContract: ReturnType<typeof TheWordDescriptorFactory.connect>;
  thewordSeederContract: ReturnType<typeof TheWordSeederFactory.connect>;
  thewordDaoContract: ReturnType<typeof TheWordDaoLogicV1Factory.connect>;
}

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
  Local = 31337,
}
