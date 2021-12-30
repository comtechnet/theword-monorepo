import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { BigNumberish } from '@ethersproject/bignumber';
import BigNumber from 'bignumber.js';

export interface IBid {
  id: string;
  bidder: {
    id: string;
  };
  amount: BigNumber;
  blockNumber: number;
  blockTimestamp: number;
  txIndex?: number;
  theword: {
    id: number;
    startTime?: BigNumberish;
    endTime?: BigNumberish;
    settled?: boolean;
  };
}

export const offeringQuery = (offeringId: number) => gql`
{
	offering(id: ${offeringId}) {
	  id
	  amount
	  settled
	  bidder {
	  	id
	  }
	  startTime
	  endTime
	  theword {
		id
		seed {
		  id
		  background
		  body
		  accessory
		  head
		  glasses
		}
		owner {
		  id
		}
	  }
	  bids {
		id
		blockNumber
		txIndex
		amount
	  }
	}
  }
  `;

export const bidsByOfferingQuery = (offeringId: string) => gql`
 {
	bids(where:{offering: "${offeringId}"}) {
	  id
	  amount
	  blockNumber
	  blockTimestamp
	  txIndex
	  bidder {
	  	id
	  }
	  theword {
		id
	  }
	}
  }
 `;

export const thewordQuery = (id: string) => gql`
 {
	theword(id:"${id}") {
	  id
	  seed {
	  background
		body
		accessory
		head
		glasses
	}
	  owner {
		id
	  }
	}
  }
 `;

export const thewordIndex = () => gql`
  {
    theword {
      id
      owner {
        id
      }
    }
  }
`;

export const latestOfferingsQuery = () => gql`
  {
    offerings(orderBy: startTime, orderDirection: desc, first: 1000) {
      id
      amount
      settled
      bidder {
        id
      }
      startTime
      endTime
      theword {
        id
        owner {
          id
        }
      }
      bids {
        id
        amount
        blockNumber
        blockTimestamp
        txIndex
        bidder {
          id
        }
      }
    }
  }
`;

export const latestBidsQuery = (first: number = 10) => gql`
{
	bids(
	  first: ${first},
	  orderBy:blockTimestamp,
	  orderDirection: desc
	) {
	  id
	  bidder {
		id
	  }
	  amount
	  blockTimestamp
	  txIndex
	  blockNumber
	  offering {
		id
		startTime
		endTime
		settled
	  }
	}
  }  
`;

export const thewordVotingHistoryQuery = (thewordId: number) => gql`
{
	theword(id: ${thewordId}) {
		id
		votes {
		proposal {
			id
		}
		support
		supportDetailed
		}
	}
}
`;

export const highestTheWordIdMintedAtProposalTime = (proposalStartBlock: number) => gql`
{
	offerings(orderBy: endTime orderDirection: desc first: 1 block: { number: ${proposalStartBlock} }) {
		id
	}
}`;

export const clientFactory = (uri: string) =>
  new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
