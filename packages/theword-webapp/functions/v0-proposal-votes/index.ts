import { Handler } from '@netlify/functions';
import { NormalizedTheWord, NormalizedVote, thewordQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

interface ProposalVote {
  thewordId: number;
  owner: string;
  delegatedTo: null | string;
  supportDetailed: number;
}

interface ProposalVotes {
  [key: number]: ProposalVote[];
}

const builtProposalVote = (theword: NormalizedTheWord, vote: NormalizedVote): ProposalVote => ({
  thewordId: theword.id,
  owner: theword.owner,
  delegatedTo: theword.delegatedTo,
  supportDetailed: vote.supportDetailed,
});

const reduceProposalVotes = (theword: NormalizedTheWord[]) =>
  theword.reduce((acc: ProposalVotes, theword: NormalizedTheWord) => {
    for (let i in theword.votes) {
      const vote = theword.votes[i];
      if (!acc[vote.proposalId]) acc[vote.proposalId] = [];
      acc[vote.proposalId].push(builtProposalVote(theword, vote));
    }
    return acc;
  }, {});

const handler: Handler = async (event, context) => {
  const theword = await thewordQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(reduceProposalVotes(theword)),
  };
};

export { handler };
