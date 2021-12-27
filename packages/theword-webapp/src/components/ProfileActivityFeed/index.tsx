import React from 'react';
import { Col, Table } from 'react-bootstrap';
import Section from '../../layout/Section';
import classes from './ProfileActivityFeed.module.css';

import { useQuery } from '@apollo/client';
import { Proposal, useAllProposals } from '../../wrappers/thewordDao';
import { thewordVotingHistoryQuery } from '../../wrappers/subgraph';
import TheWordProfileVoteRow from '../TheWordProfileVoteRow';
import { LoadingTheWord } from '../TheWord';

interface ProfileActivityFeedProps {
  thewordId: number;
}

interface ProposalInfo {
  id: number;
}

export interface TheWordVoteHistory {
  proposal: ProposalInfo;
  support: boolean;
  supportDetailed: number;
}

const ProfileActivityFeed: React.FC<ProfileActivityFeedProps> = props => {
  const { thewordId } = props;

  const { loading, error, data } = useQuery(thewordVotingHistoryQuery(thewordId));
  const { data: proposals } = useAllProposals();

  if (loading) {
    return <></>;
  } else if (error) {
    return <div>Failed to fetch theword activity history</div>;
  }

  const thewordVotes: { [key: string]: TheWordVoteHistory } = data.theword.votes
    .slice(0)
    .reduce((acc: any, h: TheWordVoteHistory, i: number) => {
      acc[h.proposal.id] = h;
      return acc;
    }, {});

  const latestProposalId = proposals?.length;

  return (
    <Section fullWidth={false}>
      <Col lg={{ span: 10, offset: 1 }}>
        <div className={classes.headerWrapper}>
          <h1>Activity</h1>
        </div>

        <Table responsive hover>
          <tbody className={classes.thewordInfoPadding}>
            {proposals?.length ? (
              proposals
                .slice(0)
                .reverse()
                .map((p: Proposal, i: number) => {
                  const vote = p.id ? thewordVotes[p.id] : undefined;
                  return (
                    <TheWordProfileVoteRow
                      proposal={p}
                      vote={vote}
                      latestProposalId={latestProposalId}
                      thewordId={thewordId}
                      key={i}
                    />
                  );
                })
            ) : (
              <LoadingTheWord />
            )}
          </tbody>
        </Table>
      </Col>
    </Section>
  );
};

export default ProfileActivityFeed;
