import { log } from '@graphprotocol/graph-ts';
import {
  DelegateChanged,
  DelegateVotesChanged,
  TheWordCreated,
  Transfer,
} from './types/thewordToken/thewordToken';
import { TheWord, Seed } from './types/schema';
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';
import { getGovernanceEntity, getOrCreateDelegate, getOrCreateAccount } from './utils/helpers';

export function handleTheWordCreated(event: TheWordCreated): void {
  const thewordId = event.params.tokenId.toString();

  const seed = new Seed(thewordId);
  seed.background = event.params.seed.background;
  seed.body = event.params.seed.body;
  seed.accessory = event.params.seed.accessory;
  seed.head = event.params.seed.head;
  seed.glasses = event.params.seed.glasses;
  seed.save();

  const theword = TheWord.load(thewordId);
  if (theword == null) {
    log.error('[handleTheWordCreated] TheWord #{} not found. Hash: {}', [
      thewordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  theword.seed = seed.id;
  theword.save();
}

let accounttheword: string[] = []; // Use WebAssembly global due to lack of closure support
export function handleDelegateChanged(event: DelegateChanged): void {
  const tokenHolder = getOrCreateAccount(event.params.delegator.toHexString());
  const previousDelegate = getOrCreateDelegate(event.params.fromDelegate.toHexString());
  const newDelegate = getOrCreateDelegate(event.params.toDelegate.toHexString());
  accounttheword = tokenHolder.theword;

  tokenHolder.delegate = newDelegate.id;
  tokenHolder.save();

  previousDelegate.tokenHoldersRepresentedAmount -= 1;
  const previousthewordRepresented = previousDelegate.thewordRepresented; // Re-assignment required to update array
  previousDelegate.thewordRepresented = previousthewordRepresented.filter(
    (n) => !accounttheword.includes(n),
  );
  newDelegate.tokenHoldersRepresentedAmount += 1;
  const newthewordRepresented = newDelegate.thewordRepresented; // Re-assignment required to update array
  for (let i = 0; i < accounttheword.length; i++) {
    newthewordRepresented.push(accounttheword[i]);
  }
  newDelegate.thewordRepresented = newthewordRepresented;
  previousDelegate.save();
  newDelegate.save();
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  const governance = getGovernanceEntity();
  const delegate = getOrCreateDelegate(event.params.delegate.toHexString());
  const votesDifference = event.params.newBalance - event.params.previousBalance;

  delegate.delegatedVotesRaw = event.params.newBalance;
  delegate.delegatedVotes = event.params.newBalance;
  delegate.save();

  if (event.params.previousBalance == BIGINT_ZERO && event.params.newBalance > BIGINT_ZERO) {
    governance.currentDelegates += BIGINT_ONE;
  }
  if (event.params.newBalance == BIGINT_ZERO) {
    governance.currentDelegates -= BIGINT_ONE;
  }
  governance.delegatedVotesRaw += votesDifference;
  governance.delegatedVotes = governance.delegatedVotesRaw;
  governance.save();
}

let transferredTheWordId: string; // Use WebAssembly global due to lack of closure support
export function handleTransfer(event: Transfer): void {
  const fromHolder = getOrCreateAccount(event.params.from.toHexString());
  const toHolder = getOrCreateAccount(event.params.to.toHexString());
  const governance = getGovernanceEntity();
  transferredTheWordId = event.params.tokenId.toString();

  // fromHolder
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders += BIGINT_ONE;
    governance.save();
  } else {
    const fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw -= BIGINT_ONE;
    fromHolder.tokenBalance = fromHolder.tokenBalanceRaw;
    const fromHoldertheword = fromHolder.theword; // Re-assignment required to update array
    fromHolder.theword = fromHoldertheword.filter((n) => n !== transferredTheWordId);

    if (fromHolder.delegate != null) {
      const fromHolderDelegate = getOrCreateDelegate(fromHolder.delegate);
      const fromHolderthewordRepresented = fromHolderDelegate.thewordRepresented; // Re-assignment required to update array
      fromHolderDelegate.thewordRepresented = fromHolderthewordRepresented.filter(
        (n) => n !== transferredTheWordId,
      );
      fromHolderDelegate.save();
    }

    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error('Negative balance on holder {} with balance {}', [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }

    if (fromHolder.tokenBalanceRaw == BIGINT_ZERO && fromHolderPreviousBalance > BIGINT_ZERO) {
      governance.currentTokenHolders -= BIGINT_ONE;
      governance.save();

      fromHolder.delegate = null;
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO
      && fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders += BIGINT_ONE;
      governance.save();
    }

    fromHolder.save();
  }

  // toHolder
  if (event.params.to.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders -= BIGINT_ONE;
    governance.save();
  }

  const toHolderDelegate = getOrCreateDelegate(toHolder.id);
  const toHolderthewordRepresented = toHolderDelegate.thewordRepresented; // Re-assignment required to update array
  toHolderthewordRepresented.push(transferredTheWordId);
  toHolderDelegate.thewordRepresented = toHolderthewordRepresented;
  toHolderDelegate.save();

  const toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw += BIGINT_ONE;
  toHolder.tokenBalance = toHolder.tokenBalanceRaw;
  toHolder.totalTokensHeldRaw += BIGINT_ONE;
  toHolder.totalTokensHeld = toHolder.totalTokensHeldRaw;
  const toHoldertheword = toHolder.theword; // Re-assignment required to update array
  toHoldertheword.push(event.params.tokenId.toString());
  toHolder.theword = toHoldertheword;

  if (toHolder.tokenBalanceRaw == BIGINT_ZERO && toHolderPreviousBalance > BIGINT_ZERO) {
    governance.currentTokenHolders -= BIGINT_ONE;
    governance.save();
  } else if (toHolder.tokenBalanceRaw > BIGINT_ZERO && toHolderPreviousBalance == BIGINT_ZERO) {
    governance.currentTokenHolders += BIGINT_ONE;
    governance.save();

    toHolder.delegate = toHolder.id;
  }

  let theword = TheWord.load(transferredTheWordId);
  if (theword == null) {
    theword = new TheWord(transferredTheWordId);
  }

  theword.owner = toHolder.id;
  theword.save();

  toHolder.save();
}
