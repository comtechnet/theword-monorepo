import { ethers } from 'ethers';
import sharp from 'sharp';
import { isError, tryF } from 'ts-try';
import { thewordTokenContract } from './clients';
import { Bid, TokenMetadata } from './types';

/**
 * Try to reverse resolve an ENS domain and return it for display,
 * If no result truncate the address and return it
 * @param address The address to ENS lookup or format
 * @returns The resolved ENS lookup domain or a formatted address
 */
export async function resolveEnsOrFormatAddress(address: string) {
  return (
    (await ethers.getDefaultProvider().lookupAddress(address))
    || `${address.substr(0, 4)}...${address.substr(address.length - 4)}`
  );
}

/**
 * Get tweet text for offering started.
 * @param offeringId The started offering id.
 * @param durationSeconds The duration of the offering in seconds.
 * @returns Text to be used in tweet when offering starts.
 */
export function formatOfferingStartedTweetText(offeringId: number) {
  return `＊Bleep Bloop Blop＊
        
 An offering has started for TheWord #${offeringId}
 Learn more at https://theword.wtf`;
}

/**
 * Get the formatted text for a new bid.
 * @param id The offering/theword id
 * @param bid The amount of the current bid
 * @returns The bid update tweet text
 */
export async function formatBidMessageText(id: number, bid: Bid) {
  const bidder = await resolveEnsOrFormatAddress(bid.bidder.id);
  return `TheWord ${id} has received a bid of Ξ${ethers.utils.formatEther(bid.amount)} from ${bidder}`;
}

/**
 * Get the tweet text for an offering ending soon.
 * @returns The offering ending soon text
 */
export function getOfferingEndingSoonTweetText() {
  return `This offering is ending soon! Bid now at https://theword.wtf`;
}

/**
 * Get the PNG buffer data of a TheWord
 * @param tokenId The ERC721 token id
 * @returns The png buffer of the TheWord or undefined
 */
export async function getTheWordPngBuffer(tokenId: string): Promise<Buffer | undefined> {
  const dataURI = await tryF(() => thewordTokenContract.dataURI(tokenId));
  if (isError(dataURI)) {
    console.error(`Error fetching dataURI for token ID ${tokenId}: ${dataURI.message}`);
    return;
  }

  const data: TokenMetadata = JSON.parse(
    Buffer.from(dataURI.substring(29), 'base64').toString('ascii'),
  );
  const svg = Buffer.from(data.image.substring(26), 'base64');
  return sharp(svg).png().toBuffer();
}

/**
 * Generate a counter name with the appropriate
 * prefix
 * @param counterName Counter name to prefix
 * @returns Prefixed counter name
 */
export const buildCounterName = (counterName: string) => `bots_${counterName}`;
