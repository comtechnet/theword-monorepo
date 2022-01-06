import React from 'react';
import { Col } from 'react-bootstrap';

import classes from './TheWordInfoCard.module.css';

import _AddressIcon from '../../assets/icons/Address.svg';
import _BidsIcon from '../../assets/icons/Bids.svg';

import TheWordInfoRowBirthday from '../TheWordInfoRowBirthday';
import TheWordInfoRowHolder from '../TheWordInfoRowHolder';
import TheWordInfoRowButton from '../TheWordInfoRowButton';
import { useHistory } from 'react-router';
import { useAppSelector } from '../../hooks';

import config from '../../config';
import { buildEtherscanAddressLink } from '../../utils/etherscan';
import { setOnDisplayOfferingTheWordId } from '../../state/slices/onDisplayOffering';
import { useDispatch } from 'react-redux';

interface TheWordInfoCardProps {
  thewordId: number;
}

const TheWordInfoCard: React.FC<TheWordInfoCardProps> = props => {
  const { thewordId } = props;
  const history = useHistory();
  const dispatch = useDispatch();

  const etherscanBaseURL = buildEtherscanAddressLink(config.addresses.thewordToken);
  const bidHistoryButtonClickHandler = () => {
    dispatch(setOnDisplayOfferingTheWordId(thewordId));
    history.push(`/offering/${thewordId}`);
  };
  // eslint-disable-next-line no-restricted-globals
  const etherscanButtonClickHandler = () => (location.href = `${etherscanBaseURL}/${thewordId}`);

  const lastOfferingTheWordId = useAppSelector(
    state => state.onDisplayOffering.lastOfferingTheWordId,
  );

  return (
    <>
      <Col lg={12}>
        <div className={classes.thewordInfoHeader}>
          <h3>Profile</h3>
          <h2>TheWord {thewordId}</h2>
        </div>
      </Col>
      <Col lg={12} className={classes.thewordInfoRow}>
        <TheWordInfoRowBirthday thewordId={thewordId} />
      </Col>
      <Col lg={12} className={classes.thewordInfoRow}>
        <TheWordInfoRowHolder thewordId={thewordId} />
      </Col>
      <Col lg={12} className={classes.thewordInfoRow}>
        <TheWordInfoRowButton
          iconImgSource={_BidsIcon}
          btnText={lastOfferingTheWordId === thewordId ? 'Bids' : 'Bid history'}
          onClickHandler={bidHistoryButtonClickHandler}
        />
        <TheWordInfoRowButton
          iconImgSource={_AddressIcon}
          btnText={'Etherscan'}
          onClickHandler={etherscanButtonClickHandler}
        />
      </Col>
    </>
  );
};

export default TheWordInfoCard;
