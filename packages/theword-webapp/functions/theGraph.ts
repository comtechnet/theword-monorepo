import axios from 'axios';
import * as R from 'ramda';
import config from '../src/config';
import { bigNumbersEqual } from './utils';

export interface NormalizedVote {
  proposalId: number;
  supportDetailed: number;
}

export interface Seed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

export interface NormalizedTheWord {
  id: number;
  owner: string;
  delegatedTo: null | string;
  votes: NormalizedVote[];
  seed: Seed;
}

const thewordGql = `
{
  theword {
    id
    owner {
      id
	    delegate {
		    id
	    }
    }
    votes {
      proposal {
        id
      }
      supportDetailed
    }
    seed {
      background
      body
      accessory
      head
      glasses
    }
  }
}
`;

export const normalizeVote = (vote: any): NormalizedVote => ({
  proposalId: Number(vote.proposal.id),
  supportDetailed: Number(vote.supportDetailed),
});

export const normalizeSeed = (seed: any): Seed => ({
  background: Number(seed.background),
  body: Number(seed.body),
  glasses: Number(seed.glasses),
  accessory: Number(seed.accessory),
  head: Number(seed.head),
});

export const normalizeTheWord = (theword: any): NormalizedTheWord => ({
  id: Number(theword.id),
  owner: theword.owner.id,
  delegatedTo: theword.owner.delegate?.id,
  votes: normalizeVotes(theword.votes),
  seed: normalizeSeed(theword.seed),
});

export const normalizetheword = R.map(normalizeTheWord);

export const normalizeVotes = R.map(normalizeVote);

export const ownerFilterFactory = (address: string) =>
  R.filter((theword: any) => bigNumbersEqual(address, theword.owner));

export const isTheWordOwner = (address: string, theword: NormalizedTheWord[]) =>
  ownerFilterFactory(address)(theword).length > 0;

export const delegateFilterFactory = (address: string) =>
  R.filter((theword: any) => theword.delegatedTo && bigNumbersEqual(address, theword.delegatedTo));

export const isTheWordDelegate = (address: string, theword: NormalizedTheWord[]) =>
  delegateFilterFactory(address)(theword).length > 0;

export const thewordQuery = async () =>
  normalizetheword(
    (await axios.post(config.app.subgraphApiUri, { query: thewordGql })).data.data.theword,
  );
