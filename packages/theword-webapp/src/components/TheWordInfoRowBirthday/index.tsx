import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import { isTheWordderTheWord } from '../../utils/thewordderTheWord';

import classes from './TheWordInfoRowBirthday.module.css';
import _BirthdayIcon from '../../assets/icons/Birthday.svg';

import { Image } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { OfferingState } from '../../state/slices/offering';

interface TheWordInfoRowBirthdayProps {
  thewordId: number;
}

const TheWordInfoRowBirthday: React.FC<TheWordInfoRowBirthdayProps> = props => {
  const { thewordId } = props;

  // If the theword is a thewordder theword, use the next theword to get the mint date.
  // We do this because we use the offering start time to get the mint date and
  // thewordder theword do not have an offering start time.
  const thewordIdForQuery = isTheWordderTheWord(BigNumber.from(thewordId))
    ? thewordId + 1
    : thewordId;

  const pastOfferings = useAppSelector(state => state.pastOfferings.pastOfferings);
  if (!pastOfferings || !pastOfferings.length) {
    return <></>;
  }

  const startTime = BigNumber.from(
    pastOfferings.find((offering: OfferingState, i: number) => {
      const maybeTheWordId = offering.activeOffering?.thewordId;
      return maybeTheWordId
        ? BigNumber.from(maybeTheWordId).eq(BigNumber.from(thewordIdForQuery))
        : false;
    })?.activeOffering?.startTime,
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
