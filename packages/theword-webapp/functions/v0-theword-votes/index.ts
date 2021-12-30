import { Handler } from '@netlify/functions';
import { NormalizedVote, thewordQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface TheWordVote {
  id: number;
  owner: string;
  delegatedTo: null | string;
  votes: NormalizedVote[];
}

const buildTheWordVote = R.pick(['id', 'owner', 'delegatedTo', 'votes']);

const buildTheWordVotes = R.map(buildTheWordVote);

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  const thewordVotes: TheWordVote[] = buildTheWordVotes(theword);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(thewordVotes),
  };
};

export { handler };
