import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import { isTheWordderTheWord } from '../../utils/thewordderTheWord';

import classes from './TheWordInfoRowBirthday.module.css';
import _BirthdayIcon from '../../assets/icons/Birthday.svg';

import { Image } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { AuctionState } from '../../state/slices/auction';

interface TheWordInfoRowBirthdayProps {
  thewordId: number;
}

const TheWordInfoRowBirthday: React.FC<TheWordInfoRowBirthdayProps> = props => {
  const { thewordId } = props;

  // If the theword is a thewordder theword, use the next theword to get the mint date.
  // We do this because we use the auction start time to get the mint date and
  // thewordder theword do not have an auction start time.
  const thewordIdForQuery = isTheWordderTheWord(BigNumber.from(thewordId)) ? thewordId + 1 : thewordId;

  const pastAuctions = useAppSelector(state => state.pastAuctions.pastAuctions);
  if (!pastAuctions || !pastAuctions.length) {
    return <></>;
  }

  const startTime = BigNumber.from(
    pastAuctions.find((auction: AuctionState, i: number) => {
      const maybeTheWordId = auction.activeAuction?.thewordId;
      return maybeTheWordId ? BigNumber.from(maybeTheWordId).eq(BigNumber.from(thewordIdForQuery)) : false;
    })?.activeAuction?.startTime,
  );

  if (!startTime) {
    return <>Error fetching theword birthday</>;
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const birthday = new Date(Number(startTime._hex) * 1000);

  return (
    <div className={classes.birthdayInfoContainer}>
      <span>
        <Image src={_BirthdayIcon} className={classes.birthdayIcon} />
      </span>
      Born
      <span className={classes.thewordInfoRowBirthday}>
        {monthNames[birthday.getUTCMonth()]} {birthday.getUTCDate()}, {birthday.getUTCFullYear()}
      </span>
    </div>
  );
};

export default TheWordInfoRowBirthday;
