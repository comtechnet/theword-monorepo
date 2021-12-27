import { Handler } from '@netlify/functions';
import { thewordQuery, Seed } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface SeededNoun {
  id: number;
  seed: Seed;
}

const buildSeededNoun = R.pick(['id', 'seed']);

const buildSeededtheword = R.map(buildSeededNoun);

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  const seededtheword: SeededNoun[] = buildSeededtheword(theword);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(seededtheword),
  };
};

export { handler };
