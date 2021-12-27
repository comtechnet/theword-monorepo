import { useContractCall, useEthers } from '@usedapp/core';
import { BigNumber as EthersBN, utils } from 'ethers';
import { thewordTokenABI } from '@theword/contracts';
import config from '../config';

interface TheWordToken {
  name: string;
  description: string;
  image: string;
}

export interface Ithewordeed {
  accessory: number;
  background: number;
  body: number;
  glasses: number;
  head: number;
}

const abi = new utils.Interface(thewordTokenABI);

export const useTheWordToken = (thewordId: EthersBN) => {
  const [theword] =
    useContractCall<[string]>({
      abi,
      address: config.addresses.thewordToken,
      method: 'dataURI',
      args: [thewordId],
    }) || [];

  if (!theword) {
    return;
  }

  const thewordImgData = theword.split(';base64,').pop() as string;
  const json: TheWordToken = JSON.parse(atob(thewordImgData));

  return json;
};

export const usethewordeed = (thewordId: EthersBN) => {
  const seed = useContractCall<Ithewordeed>({
    abi,
    address: config.addresses.thewordToken,
    method: 'seeds',
    args: [thewordId],
  });
  return seed;
};

export const useUserVotes = (): number | undefined => {
  const { account } = useEthers();
  const [votes] =
    useContractCall<[EthersBN]>({
      abi,
      address: config.addresses.thewordToken,
      method: 'getCurrentVotes',
      args: [account],
    }) || [];
  return votes?.toNumber();
};

export const useUserDelegatee = (): string | undefined => {
  const { account } = useEthers();
  const [delegate] =
    useContractCall<[string]>({
      abi,
      address: config.addresses.thewordToken,
      method: 'delegates',
      args: [account],
    }) || [];
  return delegate;
};

export const useUserVotesAsOfBlock = (block: number | undefined): number | undefined => {
  const { account } = useEthers();

  // Check for available votes
  const [votes] =
    useContractCall<[EthersBN]>({
      abi,
      address: config.addresses.thewordToken,
      method: 'getPriorVotes',
      args: [account, block],
    }) || [];
  return votes?.toNumber();
};
