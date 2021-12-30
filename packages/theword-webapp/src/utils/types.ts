import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export interface BidEvent {
  thewordId: BigNumberish;
  sender: string;
  value: BigNumberish;
  extended: boolean;
  transactionHash: string;
  timestamp: BigNumberish;
}

export interface OfferingCreateEvent {
  thewordId: BigNumberish;
  startTime: BigNumberish;
  endTime: BigNumberish;
  settled: boolean;
}

export interface OfferingSettledEvent {
  thewordId: BigNumberish;
  winner: string;
  amount: BigNumberish;
}

export interface OfferingExtendedEvent {
  thewordId: BigNumberish;
  endTime: BigNumberish;
}

export interface Bid {
  thewordId: BigNumber;
  sender: string;
  value: BigNumber;
  extended: boolean;
  transactionHash: string;
  timestamp: BigNumber;
}
