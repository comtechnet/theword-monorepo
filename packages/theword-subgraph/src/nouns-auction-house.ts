import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  OfferingBid,
  OfferingCreated,
  OfferingExtended,
  OfferingSettled,
} from './types/thewordOfferingHouse/thewordOfferingHouse';
import { Offering, TheWord, Bid } from './types/schema';
import { getOrCreateAccount } from './utils/helpers';

export function handleOfferingCreated(event: OfferingCreated): void {
  const thewordId = event.params.thewordId.toString();

  const theword = TheWord.load(thewordId);
  if (theword == null) {
    log.error('[handleOfferingCreated] TheWord #{} not found. Hash: {}', [
      thewordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const offering = new Offering(thewordId);
  offering.theword = theword.id;
  offering.amount = BigInt.fromI32(0);
  offering.startTime = event.params.startTime;
  offering.endTime = event.params.endTime;
  offering.settled = false;
  offering.save();
}

export function handleOfferingBid(event: OfferingBid): void {
  const thewordId = event.params.thewordId.toString();
  const bidderAddress = event.params.sender.toHex();

  const bidder = getOrCreateAccount(bidderAddress);

  const offering = Offering.load(thewordId);
  if (offering == null) {
    log.error('[handleOfferingBid] Offering not found for TheWord #{}. Hash: {}', [
      thewordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  offering.amount = event.params.value;
  offering.bidder = bidder.id;
  offering.save();

  // Save Bid
  const bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = offering.amount;
  bid.theword = offering.theword;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.offering = offering.id;
  bid.save();
}

export function handleOfferingExtended(event: OfferingExtended): void {
  const thewordId = event.params.thewordId.toString();

  const offering = Offering.load(thewordId);
  if (offering == null) {
    log.error('[handleOfferingExtended] Offering not found for TheWord #{}. Hash: {}', [
      thewordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  offering.endTime = event.params.endTime;
  offering.save();
}

export function handleOfferingSettled(event: OfferingSettled): void {
  const thewordId = event.params.thewordId.toString();

  const offering = Offering.load(thewordId);
  if (offering == null) {
    log.error('[handleOfferingSettled] Offering not found for TheWord #{}. Hash: {}', [
      thewordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  offering.settled = true;
  offering.save();
}
