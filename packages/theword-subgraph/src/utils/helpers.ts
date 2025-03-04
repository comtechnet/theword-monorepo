import { Account, Delegate, Proposal, Governance, Vote } from '../types/schema';
import { ZERO_ADDRESS, BIGINT_ZERO, BIGINT_ONE } from './constants';

export function getOrCreateAccount(id: string, createIfNotFound = true, save = true): Account {
  let tokenHolder = Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = BIGINT_ZERO;
    tokenHolder.tokenBalance = BIGINT_ZERO;
    tokenHolder.totalTokensHeldRaw = BIGINT_ZERO;
    tokenHolder.totalTokensHeld = BIGINT_ZERO;
    tokenHolder.theword = [];

    if (save) {
      tokenHolder.save();
    }
  }

  return tokenHolder as Account;
}

export function getOrCreateDelegate(id: string, createIfNotFound = true, save = true): Delegate {
  let delegate = Delegate.load(id);

  if (delegate == null && createIfNotFound) {
    delegate = new Delegate(id);
    delegate.delegatedVotesRaw = BIGINT_ZERO;
    delegate.delegatedVotes = BIGINT_ZERO;
    delegate.tokenHoldersRepresentedAmount = 0;
    delegate.thewordRepresented = [];

    if (id != ZERO_ADDRESS) {
      const governance = getGovernanceEntity();
      governance.totalDelegates += BIGINT_ONE;
      governance.save();
    }

    if (save) {
      delegate.save();
    }
  }

  return delegate as Delegate;
}

export function getOrCreateVote(id: string, createIfNotFound = true, save = false): Vote {
  let vote = Vote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new Vote(id);

    if (save) {
      vote.save();
    }
  }

  return vote as Vote;
}

export function getOrCreateProposal(id: string, createIfNotFound = true, save = false): Proposal {
  let proposal = Proposal.load(id);

  if (proposal == null && createIfNotFound) {
    proposal = new Proposal(id);

    const governance = getGovernanceEntity();

    governance.proposals += BIGINT_ONE;
    governance.save();

    if (save) {
      proposal.save();
    }
  }

  return proposal as Proposal;
}

export function getGovernanceEntity(): Governance {
  let governance = Governance.load('GOVERNANCE');

  if (governance == null) {
    governance = new Governance('GOVERNANCE');
    governance.proposals = BIGINT_ZERO;
    governance.totalTokenHolders = BIGINT_ZERO;
    governance.currentTokenHolders = BIGINT_ZERO;
    governance.currentDelegates = BIGINT_ZERO;
    governance.totalDelegates = BIGINT_ZERO;
    governance.delegatedVotesRaw = BIGINT_ZERO;
    governance.delegatedVotes = BIGINT_ZERO;
    governance.proposalsQueued = BIGINT_ZERO;
  }

  return governance as Governance;
}
