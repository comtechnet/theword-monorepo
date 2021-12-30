import { Offering } from '../wrappers/thewordOffering';
import { OfferingState } from '../state/slices/offering';
import { BigNumber } from '@ethersproject/bignumber';

export const isTheWordderTheWord = (thewordId: BigNumber) => {
  return thewordId.mod(10).eq(0) || thewordId.eq(0);
};

const emptyTheWordderOffering = (onDisplayOfferingId: number): Offering => {
  return {
    amount: BigNumber.from(0).toJSON(),
    bidder: '',
    startTime: BigNumber.from(0).toJSON(),
    endTime: BigNumber.from(0).toJSON(),
    thewordId: BigNumber.from(onDisplayOfferingId).toJSON(),
    settled: false,
  };
};

const findOffering = (id: BigNumber, offerings: OfferingState[]): Offering | undefined => {
  return offerings.find(offering => {
    return BigNumber.from(offering.activeOffering?.thewordId).eq(id);
  })?.activeOffering;
};

/**
 *
 * @param thewordId
 * @param pastOfferings
 * @returns empty `Offering` object with `startTime` set to offering after param `thewordId`
 */
export const generateEmptyTheWordderOffering = (
  thewordId: BigNumber,
  pastOfferings: OfferingState[],
): Offering => {
  const thewordderOffering = emptyTheWordderOffering(thewordId.toNumber());
  // use thewordderOffering.thewordId + 1 to get mint time
  const offeringAbove = findOffering(thewordId.add(1), pastOfferings);
  const offeringAboveStartTime = offeringAbove && BigNumber.from(offeringAbove.startTime);
  if (offeringAboveStartTime) thewordderOffering.startTime = offeringAboveStartTime.toJSON();

  return thewordderOffering;
};
