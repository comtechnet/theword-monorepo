import { getOfferingReplyTweetId, updateOfferingReplyTweetId } from '../cache';
import { twitter } from '../clients';
import { IOfferingLifecycleHandler, Bid } from '../types';
import {
  getOfferingEndingSoonTweetText,
  formatOfferingStartedTweetText,
  formatBidMessageText,
  getTheWordPngBuffer,
} from '../utils';

export class TwitterOfferingLifecycleHandler implements IOfferingLifecycleHandler {
  /**
   * Tweet an image of the current theword alerting users
   * to the new offering and update the tweet reply id cache
   * @param offeringId The current offering ID
   */
  async handleNewOffering(offeringId: number) {
    const png = await getTheWordPngBuffer(offeringId.toString());
    if (png) {
      console.log(`handleNewOffering tweeting discovered offering id ${offeringId}`);
      const mediaId = await twitter.v1.uploadMedia(png, { type: 'png' });
      const tweet = await twitter.v1.tweet(formatOfferingStartedTweetText(offeringId), {
        media_ids: mediaId,
      });
      await updateOfferingReplyTweetId(tweet.id_str);
    }
    console.log(`processed twitter new offering ${offeringId}`);
  }

  /**
   * Tweet a reply with new bid information to the reply id cache
   * We intentionally update the bid cache before safety checks to ensure we do not double tweet a bid
   * @param offeringId The current offering id
   * @param bid The current bid
   */
  async handleNewBid(offeringId: number, bid: Bid) {
    const tweetReplyId = await getOfferingReplyTweetId();
    if (!tweetReplyId) {
      console.error(`handleNewBid no reply tweet id exists: offering(${offeringId}) bid(${bid.id})`);
      return;
    }
    const tweet = await twitter.v1.reply(await formatBidMessageText(offeringId, bid), tweetReplyId);
    await updateOfferingReplyTweetId(tweet.id_str);
    console.log(`processed twitter new bid ${bid.id}:${offeringId}`);
  }

  /**
   * Tweet a reply informing observers that the offering is ending soon
   * @param offeringId The current offering id
   */
  async handleOfferingEndingSoon(offeringId: number) {
    const tweetReplyId = await getOfferingReplyTweetId();
    if (!tweetReplyId) {
      console.error(`handleOfferingEndingSoon no reply tweet id exists for offering ${offeringId}`);
      return;
    }
    const tweet = await twitter.v1.reply(getOfferingEndingSoonTweetText(), tweetReplyId);
    await updateOfferingReplyTweetId(tweet.id_str);
    console.log(`processed twitter offering ending soon update for offering ${offeringId}`);
  }
}
