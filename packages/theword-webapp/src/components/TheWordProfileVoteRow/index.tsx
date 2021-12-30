import { Proposal } from '../../wrappers/thewordDao';
import { Image } from 'react-bootstrap';
import _YesVoteIcon from '../../assets/icons/YesVote.svg';
import _NoVoteIcon from '../../assets/icons/NoVote.svg';
import _AbsentVoteIcon from '../../assets/icons/AbsentVote.svg';
import _AbstainVoteIcon from '../../assets/icons/Abstain.svg';
import { ProposalState } from '../../wrappers/thewordDao';

import classes from './TheWordProfileVoteRow.module.css';

import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { highestTheWordIdMintedAtProposalTime } from '../../wrappers/subgraph';
import VoteStatusPill from '../VoteStatusPill';

import _PendingVoteIcon from '../../assets/icons/PendingVote.svg';
import { Vote } from '../../utils/vote';
import { TheWordVoteHistory } from '../ProfileActivityFeed';

interface TheWordProfileVoteRowProps {
  proposal: Proposal;
  thewordId: number;
  latestProposalId: number;
  vote?: TheWordVoteHistory;
}

const selectIconForTheWordVoteActivityRow = (proposal: Proposal, vote?: TheWordVoteHistory) => {
  if (!vote) {
    if (proposal.status === ProposalState.PENDING || proposal.status === ProposalState.ACTIVE) {
      return <Image src={_PendingVoteIcon} className={classes.voteIcon} />;
    }
    return <Image src={_AbsentVoteIcon} className={classes.voteIcon} />;
  } else if (vote.supportDetailed) {
    switch (vote.supportDetailed) {
      case Vote.FOR:
        return <Image src={_YesVoteIcon} className={classes.voteIcon} />;
      case Vote.ABSTAIN:
      default:
        return <Image src={_AbstainVoteIcon} className={classes.voteIcon} />;
    }
  } else {
    return <Image src={_NoVoteIcon} className={classes.voteIcon} />;
  }
};

const selectVotingInfoText = (proposal: Proposal, vote?: TheWordVoteHistory) => {
  if (!vote) {
    if (proposal.status === ProposalState.PENDING || proposal.status === ProposalState.ACTIVE) {
      return 'Waiting for';
    }
    return 'Absent for';
  } else if (vote.supportDetailed) {
    switch (vote.supportDetailed) {
      case Vote.FOR:
        return 'Voted for';
      case Vote.ABSTAIN:
      default:
        return 'Abstained on';
    }
  } else {
    return 'Voted aginst';
  }
};

const selectProposalStatusIcon = (proposal: Proposal) => {
  return (
    <VoteStatusPill status={selectProposalStatus(proposal)} text={selectProposalText(proposal)} />
  );
};

const selectProposalStatus = (proposal: Proposal) => {
  switch (proposal.status) {
    case ProposalState.SUCCEEDED:
    case ProposalState.EXECUTED:
    case ProposalState.QUEUED:
      return 'success';
    case ProposalState.DEFEATED:
    case ProposalState.VETOED:
      return 'failure';
    default:
      return 'pending';
  }
};

const selectProposalText = (proposal: Proposal) => {
  switch (proposal.status) {
    case ProposalState.PENDING:
      return 'Pending';
    case ProposalState.ACTIVE:
      return 'Active';
    case ProposalState.SUCCEEDED:
      return 'Succeeded';
    case ProposalState.EXECUTED:
      return 'Executed';
    case ProposalState.DEFEATED:
      return 'Defeated';
    case ProposalState.QUEUED:
      return 'Queued';
    case ProposalState.CANCELED:
      return 'Canceled';
    case ProposalState.VETOED:
      return 'Vetoed';
    case ProposalState.EXPIRED:
      return 'Expired';
    default:
      return 'Undetermined';
  }
};

const TheWordProfileVoteRow: React.FC<TheWordProfileVoteRowProps> = props => {
  const { proposal, vote, thewordId, latestProposalId } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loading, error, data } = useQuery(highestTheWordIdMintedAtProposalTime(proposal.startBlock));
  const history = useHistory();

  if (loading) {
    return <></>;
  }

  // In this case, theword was not yet minted at time of proposal
  if (data && data.offerings.length > 0 && thewordId > data.offerings[0].id) {
    if (proposal.id === latestProposalId.toString()) {
      return (
        <tr className={classes.nullStateCopy}>This TheWord has no activity yet. Check back soon!</tr>
      );
    }
    return <></>;
  }

  const proposalOnClickHandler = () => history.push(proposal.id ? `/vote/${proposal.id}` : '/vote');

  return (
    <tr onClick={proposalOnClickHandler} className={classes.voteInfoRow}>
      <td className={classes.voteIcon}>{selectIconForTheWordVoteActivityRow(proposal, vote)}</td>
      <td>
        <div className={classes.voteInfoContainer}>
          {selectVotingInfoText(proposal, vote)}
          <span className={classes.proposalTitle}>{proposal.title}</span>
        </div>
      </td>
      <td className={classes.voteStatusWrapper}>
        <div className={classes.voteProposalStatus}>{selectProposalStatusIcon(proposal)}</div>
      </td>
    </tr>
  );
};

export default TheWordProfileVoteRow;
