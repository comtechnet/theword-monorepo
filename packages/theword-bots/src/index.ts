import { buildCounterName } from './utils';
import { internalDiscordWebhook, incrementCounter, publicDiscordWebhook } from './clients';
import { getLastOfferingBids } from './subgraph';
import {
  getOfferingCache,
  getOfferingEndingSoonCache,
  getBidCache,
  updateOfferingCache,
  updateOfferingEndingSoonCache,
  updateBidCache,
} from './cache';
import { IOfferingLifecycleHandler } from './types';
import { config } from './config';
import { TwitterOfferingLifecycleHandler } from './handlers/twitter';
import { DiscordOfferingLifecycleHandler } from './handlers/discord';

/**
 * Create configured `IOfferingLifecycleHandler`s
 */
const offeringLifecycleHandlers: IOfferingLifecycleHandler[] = [];
if (config.twitterEnabled) {
  offeringLifecycleHandlers.push(new TwitterOfferingLifecycleHandler());
}
if (config.discordEnabled) {
  offeringLifecycleHandlers.push(
    new DiscordOfferingLifecycleHandler([internalDiscordWebhook, publicDiscordWebhook]),
  );
}

/**
 * Process the last offering, update cache and push socials if new offering or respective bid is discovered
 */
async function processOfferingTick() {
  const cachedOfferingId = await getOfferingCache();
  const cachedBidId = await getBidCache();
  const cachedOfferingEndingSoon = await getOfferingEndingSoonCache();
  const lastOfferingBids = await getLastOfferingBids();
  const lastOfferingId = lastOfferingBids.id;
  console.log(
    `processOfferingTick: cachedOfferingId(${cachedOfferingId}) lastOfferingId(${lastOfferingId})`,
  );

  // check if new offering discovered
  if (cachedOfferingId < lastOfferingId) {
    await incrementCounter(buildCounterName('offerings_discovered'));
    await updateOfferingCache(lastOfferingId);
    await Promise.all(offeringLifecycleHandlers.map(h => h.handleNewOffering(lastOfferingId)));
    await incrementCounter(buildCounterName('offering_cache_updates'));
  }
  await incrementCounter(buildCounterName('offering_process_last_offering'));

  // check if new bid discovered
  if (lastOfferingBids.bids.length > 0 && cachedBidId != lastOfferingBids.bids[0].id) {
    const bid = lastOfferingBids.bids[0];
    await updateBidCache(bid.id);
    await Promise.all(offeringLifecycleHandlers.map(h => h.handleNewBid(lastOfferingId, bid)));
  }

  // check if offering ending soon (within 20 min)
  const currentTimestamp = ~~(Date.now() / 1000); // second timestamp utc
  const { endTime } = lastOfferingBids;
  const secondsUntilOfferingEnds = endTime - currentTimestamp;
  if (secondsUntilOfferingEnds < 20 * 60 && cachedOfferingEndingSoon < lastOfferingId) {
    await updateOfferingEndingSoonCache(lastOfferingId);
    await Promise.all(
      offeringLifecycleHandlers.map(h => h.handleOfferingEndingSoon(lastOfferingId)),
    );
  }
}

setInterval(async () => processOfferingTick(), 30000);
processOfferingTick().then(() => 'processOfferingTick');
