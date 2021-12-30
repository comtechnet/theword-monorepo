import { useContractCall } from '@usedapp/core';
import { BigNumber as EthersBN, utils } from 'ethers';
import { TheWordOfferingHouseABI } from '@theword/sdk';
import config from '../config';
import BigNumber from 'bignumber.js';

export enum OfferingHouseContractFunction {
  offering = 'offering',
  duration = 'duration',
  minBidIncrementPercentage = 'minBidIncrementPercentage',
  theword = 'theword',
  createBid = 'createBid',
  settleCurrentAndCreateNewOffering = 'settleCurrentAndCreateNewOffering',
}

export interface Offering {
  amount: EthersBN;
  bidder: string;
  endTime: EthersBN;
  startTime: EthersBN;
  thewordId: EthersBN;
  settled: boolean;
}

const abi = new utils.Interface(TheWordOfferingHouseABI);

export const useOffering = (offeringHouseProxyAddress: string) => {
  const offering = useContractCall<Offering>({
    abi,
    address: offeringHouseProxyAddress,
    method: 'offering',
    args: [],
  });
  return offering as Offering;
};

export const useOfferingMinBidIncPercentage = () => {
  const minBidIncrement = useContractCall({
    abi,
    address: config.addresses.thewordOfferingHouseProxy,
    method: 'minBidIncrementPercentage',
    args: [],
  });

  if (!minBidIncrement) {
    return;
  }

  return new BigNumber(minBidIncrement[0]);
};
