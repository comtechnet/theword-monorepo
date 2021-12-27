import { Handler } from '@netlify/functions';
import { isNounOwner, thewordQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isNounOwner(event.body, theword)),
  };
};

export { handler };
