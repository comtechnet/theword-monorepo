import { Handler } from '@netlify/functions';
import { thewordQuery, Seed } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface SeededTheWord {
  id: number;
  seed: Seed;
}

const buildSeededTheWord = R.pick(['id', 'seed']);

const buildSeededtheword = R.map(buildSeededTheWord);

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  const seededtheword: SeededTheWord[] = buildSeededtheword(theword);
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
