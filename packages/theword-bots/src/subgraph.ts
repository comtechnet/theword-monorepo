import { request, gql } from 'graphql-request';
import { config } from './config';
import { OfferingBids } from './types';

/**
 * Query the subgraph and return the last offering id and bid created.
 * @returns The last offering id and bid from the subgraph.
 */
export async function getLastOfferingBids(): Promise<OfferingBids> {
  const res = await request<{ offerings: OfferingBids[] }>(
    config.thewordSubgraph,
    gql`
      query {
        offerings(orderBy: startTime, orderDirection: desc, first: 1) {
          id
          endTime
          bids(orderBy: blockNumber, orderDirection: desc, first: 1) {
            id
            amount
            bidder {
              id
            }
          }
        }
      }
    `,
  );
  return res.offerings[0];
}
