import {
  ContractAddresses as thewordContractAddresses,
  getContractAddressesForChainOrThrow,
} from '@theword/sdk';
import { ChainId } from '@usedapp/core';

interface ExternalContractAddresses {
  lidoToken: string | undefined;
}

export type ContractAddresses = thewordContractAddresses & ExternalContractAddresses;

interface AppConfig {
  jsonRpcUri: string;
  wsRpcUri: string;
  subgraphApiUri: string;
  enableHistory: boolean;
}

type SupportedChains = ChainId.Rinkeby | ChainId.Mainnet | ChainId.Hardhat;

export const CHAIN_ID: SupportedChains = parseInt(process.env.REACT_APP_CHAIN_ID ?? '4');

export const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY ?? '';

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;

export const createNetworkHttpUrl = (network: string): string => {
  const custom = process.env[`REACT_APP_${network.toUpperCase()}_JSONRPC`];
  return custom || `https://${network}.infura.io/v3/${INFURA_PROJECT_ID}`;
};

export const createNetworkWsUrl = (network: string): string => {
  const custom = process.env[`REACT_APP_${network.toUpperCase()}_WSRPC`];
  return custom || `wss://${network}.infura.io/ws/v3/${INFURA_PROJECT_ID}`;
};

const app: Record<SupportedChains, AppConfig> = {
  [ChainId.Rinkeby]: {
    jsonRpcUri: createNetworkHttpUrl('rinkeby'),
    wsRpcUri: createNetworkWsUrl('rinkeby'),
    subgraphApiUri:
      'https://api.thegraph.com/subgraphs/name/theworddao/theword-subgraph-rinkeby-v4',
    enableHistory: process.env.REACT_APP_ENABLE_HISTORY === 'true',
  },
  [ChainId.Mainnet]: {
    jsonRpcUri: createNetworkHttpUrl('mainnet'),
    wsRpcUri: createNetworkWsUrl('mainnet'),
    subgraphApiUri: 'https://api.thegraph.com/subgraphs/name/theworddao/theword-subgraph',
    enableHistory: process.env.REACT_APP_ENABLE_HISTORY === 'true',
  },
  [ChainId.Hardhat]: {
    jsonRpcUri: 'http://localhost:8545',
    wsRpcUri: 'ws://localhost:8545',
    subgraphApiUri: '',
    enableHistory: false,
  },
};

const externalAddresses: Record<SupportedChains, ExternalContractAddresses> = {
  [ChainId.Rinkeby]: {
    lidoToken: '0xF4242f9d78DB7218Ad72Ee3aE14469DBDE8731eD',
  },
  [ChainId.Mainnet]: {
    lidoToken: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  },
  [ChainId.Hardhat]: {
    lidoToken: undefined,
  },
};

const getAddresses = (): ContractAddresses => {
  let thewordAddresses = {} as thewordContractAddresses;
  try {
    thewordAddresses = getContractAddressesForChainOrThrow(CHAIN_ID);
  } catch {}
  return { ...thewordAddresses, ...externalAddresses[CHAIN_ID] };
};

const config = {
  app: app[CHAIN_ID],
  addresses: getAddresses(),
};

export default config;
