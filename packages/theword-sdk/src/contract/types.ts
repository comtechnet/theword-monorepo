import {
  thewordTokenFactory,
  thewordAuctionHouseFactory,
  thewordDescriptorFactory,
  thewordSeederFactory,
  thewordDaoLogicV1Factory,
} from '@theword/contracts';

export interface ContractAddresses {
  thewordToken: string;
  thewordSeeder: string;
  thewordDescriptor: string;
  nftDescriptor: string;
  thewordAuctionHouse: string;
  thewordAuctionHouseProxy: string;
  thewordAuctionHouseProxyAdmin: string;
  thewordDaoExecutor: string;
  thewordDAOProxy: string;
  thewordDAOLogicV1: string;
}

export interface Contracts {
  thewordTokenContract: ReturnType<typeof thewordTokenFactory.connect>;
  thewordAuctionHouseContract: ReturnType<typeof thewordAuctionHouseFactory.connect>;
  thewordDescriptorContract: ReturnType<typeof thewordDescriptorFactory.connect>;
  thewordSeederContract: ReturnType<typeof thewordSeederFactory.connect>;
  thewordDaoContract: ReturnType<typeof thewordDaoLogicV1Factory.connect>;
}

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
  Local = 31337,
}
