import { Handler } from '@netlify/functions';
import { isTheWordDelegate, thewordQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isTheWordDelegate(event.body, theword)),
  };
};

export { handler };
