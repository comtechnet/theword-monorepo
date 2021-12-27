import { Handler } from '@netlify/functions';
import { thewordQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

export interface LiteNoun {
  id: number;
  owner: string;
  delegatedTo: null | string;
}

const lightenNoun = R.pick(['id', 'owner', 'delegatedTo']);

const lightentheword = R.map(lightenNoun);

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  const litetheword: LiteNoun[] = lightentheword(theword);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(litetheword),
  };
};

export { handler };
