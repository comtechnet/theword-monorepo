export interface Account {
  id: string;
}

export interface Bid {
  id: string;
  amount: string;
  bidder: Account;
}

export interface OfferingBids {
  id: number;
  endTime: number;
  bids: Bid[];
}

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
}

export interface IOfferingLifecycleHandler {
  handleNewOffering(offeringId: number): Promise<void>;
  handleNewBid(offeringId: number, bid: Bid): Promise<void>;
  handleOfferingEndingSoon(offeringId: number): Promise<void>;
}
