import { Handler } from '@netlify/functions';
import { thewordQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

export interface LiteTheWord {
  id: number;
  owner: string;
  delegatedTo: null | string;
}

const lightenTheWord = R.pick(['id', 'owner', 'delegatedTo']);

const lightentheword = R.map(lightenTheWord);

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  const litetheword: LiteTheWord[] = lightentheword(theword);
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
