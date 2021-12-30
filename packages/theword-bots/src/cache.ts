import { redis } from './clients';

/**
 * Key mapped to the current offering
 */
export const getOfferingCacheKey = 'theword_OFFERING_CACHE';

/**
 * Key mapped to the last processed bid
 */
export const getBidCacheKey = 'theword_BID_CACHE';

/**
 * Key mapped to the tweet id to reply updates to
 */
export const getReplyTweetIdKey = 'theword_REPLY_TWEET_ID';

/**
 * Key mapped to the latest offering id processed for offering ending soon
 */
export const getOfferingEndingSoonCacheKey = 'theword_OFFERING_ENDING_SOON_CACHE';

/**
 * Update the offering cache with `id`
 * @param id
 */
export async function updateOfferingCache(id: number) {
  await redis.set(getOfferingCacheKey, id);
}

/**
 * Get the contents of the bid cache
 * @returns The bid cache id or null
 */
export async function getBidCache(): Promise<string> {
  return (await redis.get(getBidCacheKey)) ?? '';
}

/**
 * Update the bid cache with an id
 * @param id The bid id to place in the cache
 */
export async function updateBidCache(id: string) {
  await redis.set(getBidCacheKey, id);
}

/**
 * Get the current tweet id to reply bids to or null
 * @returns The current tweet id to reply to or null
 */
export async function getOfferingReplyTweetId(): Promise<string | null> {
  return redis.get(getReplyTweetIdKey);
}

/**
 * Update the cache with the id_str of the tweet to reply to next
 * @param id The id_str of the tweet
 */
export async function updateOfferingReplyTweetId(id: string) {
  await redis.set(getReplyTweetIdKey, id);
}

/**
 * Get the last offering id processed for ending soon
 * @returns The last offering to be processed for ending soon
 */
export async function getOfferingEndingSoonCache(): Promise<number> {
  const offeringId = await redis.get(getOfferingEndingSoonCacheKey);
  if (offeringId) {
    return Number(offeringId);
  }
  return 0;
}

/**
 * Update the offering ending soon cache with `id`
 * @param id The offering id
 */
export async function updateOfferingEndingSoonCache(id: number) {
  await redis.set(getOfferingEndingSoonCacheKey, id);
}

/**
 * Get the current cache contents or 0 if empty
 * @returns The current cache contents as number or 0 if null
 */
export async function getOfferingCache(): Promise<number> {
  const offeringId = await redis.get(getOfferingCacheKey);
  if (offeringId) {
    return Number(offeringId);
  }
  return 0;
}
