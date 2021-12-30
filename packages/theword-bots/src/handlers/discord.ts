import Discord from 'discord.js';
import { formatBidMessageText, getTheWordPngBuffer } from '../utils';
import { Bid, IOfferingLifecycleHandler } from '../types';

export class DiscordOfferingLifecycleHandler implements IOfferingLifecycleHandler {
  constructor(public readonly discordClients: Discord.WebhookClient[]) {}

  /**
   * Send Discord message with an image of the current theword alerting users
   * @param offeringId The current offering ID
   */
  async handleNewOffering(offeringId: number) {
    const png = await getTheWordPngBuffer(offeringId.toString());
    if (png) {
      const attachmentName = `Offering-${offeringId}.png`;
      const attachment = new Discord.MessageAttachment(png, attachmentName);
      const message = new Discord.MessageEmbed()
        .setTitle('New Offering Discovered')
        .setDescription(`An offering has started for TheWord #${offeringId}`)
        .setURL('https://theword.wtf')
        .addField('TheWord ID', offeringId, true)
        .attachFiles([attachment])
        .setImage(`attachment://${attachmentName}`)
        .setTimestamp();
      await Promise.all(this.discordClients.map((c) => c.send(message)));
    }
    console.log(`processed discord new offering ${offeringId}`);
  }

  /**
   * Send Discord message with new bid event data
   * @param offeringId TheWord offering number
   * @param bid Bid amount and ID
   */
  async handleNewBid(offeringId: number, bid: Bid) {
    const message = new Discord.MessageEmbed()
      .setTitle('New Bid Placed')
      .setURL('https://theword.wtf')
      .setDescription(await formatBidMessageText(offeringId, bid))
      .setTimestamp();
    await Promise.all(this.discordClients.map((c) => c.send(message)));
    console.log(`processed discord new bid ${offeringId}:${bid.id}`);
  }

  async handleOfferingEndingSoon(_offeringId: number) {

  }
}
