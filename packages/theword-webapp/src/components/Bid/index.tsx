import { Offering, OfferingHouseContractFunction } from '../../wrappers/thewordOffering';
import { connectContractToSigner, useEthers, useContractFunction } from '@usedapp/core';
import { useAppSelector } from '../../hooks';
import React, { useEffect, useState, useRef, ChangeEvent, useCallback } from 'react';
import { utils, BigNumber as EthersBN } from 'ethers';
import BigNumber from 'bignumber.js';
import classes from './Bid.module.css';
import { Spinner, InputGroup, FormControl, Button } from 'react-bootstrap';
import { useOfferingMinBidIncPercentage } from '../../wrappers/thewordOffering';
import { useAppDispatch } from '../../hooks';
import { AlertModal, setAlertModal } from '../../state/slices/application';
import { TheWordOfferingHouseFactory } from '@theword/sdk';
import config from '../../config';

const computeMinimumNextBid = (
  currentBid: BigNumber,
  minBidIncPercentage: BigNumber | undefined,
): BigNumber => {
  return !minBidIncPercentage
    ? new BigNumber(0)
    : currentBid.times(minBidIncPercentage.div(100).plus(1));
};

const minBidEth = (minBid: BigNumber): string => {
  if (minBid.isZero()) {
    return '0.01';
  }

  const eth = Number(utils.formatEther(EthersBN.from(minBid.toString())));
  const roundedEth = Math.ceil(eth * 100) / 100;

  return roundedEth.toString();
};

const currentBid = (bidInputRef: React.RefObject<HTMLInputElement>) => {
  if (!bidInputRef.current || !bidInputRef.current.value) {
    return new BigNumber(0);
  }
  return new BigNumber(utils.parseEther(bidInputRef.current.value).toString());
};

const Bid: React.FC<{
  offering: Offering;
  offeringEnded: boolean;
}> = props => {
  const activeAccount = useAppSelector(state => state.account.activeAccount);
  const { library } = useEthers();
  const { offering, offeringEnded } = props;
  const thewordOfferingHouseContract = new TheWordOfferingHouseFactory().attach(
    config.addresses.thewordOfferingHouseProxy,
  );

  const account = useAppSelector(state => state.account.activeAccount);

  const bidInputRef = useRef<HTMLInputElement>(null);

  const [bidInput, setBidInput] = useState('');
  const [bidButtonContent, setBidButtonContent] = useState({
    loading: false,
    content: offeringEnded ? 'Settle' : 'Bid',
  });

  const dispatch = useAppDispatch();
  const setModal = useCallback((modal: AlertModal) => dispatch(setAlertModal(modal)), [dispatch]);

  const minBidIncPercentage = useOfferingMinBidIncPercentage();
  const minBid = computeMinimumNextBid(
    offering && new BigNumber(offering.amount.toString()),
    minBidIncPercentage,
  );

  const { send: placeBid, state: placeBidState } = useContractFunction(
    thewordOfferingHouseContract,
    OfferingHouseContractFunction.createBid,
  );
  const { send: settleOffering, state: settleOfferingState } = useContractFunction(
    thewordOfferingHouseContract,
    OfferingHouseContractFunction.settleCurrentAndCreateNewOffering,
  );

  const bidInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    // disable more than 2 digits after decimal point
    if (input.includes('.') && event.target.value.split('.')[1].length > 2) {
      return;
    }

    setBidInput(event.target.value);
  };

  const placeBidHandler = async () => {
    if (!offering || !bidInputRef.current || !bidInputRef.current.value) {
      return;
    }

    if (currentBid(bidInputRef).isLessThan(minBid)) {
      setModal({
        show: true,
        title: 'Insufficient bid amount 🤏',
        message: `Please place a bid higher than or equal to the minimum bid amount of ${minBidEth(
          minBid,
        )} ETH.`,
      });
      setBidInput(minBidEth(minBid));
      return;
    }

    const value = utils.parseEther(bidInputRef.current.value.toString());
    const contract = connectContractToSigner(thewordOfferingHouseContract, undefined, library);
    const gasLimit = await contract.estimateGas.createBid(offering.thewordId, {
      value,
    });
    placeBid(offering.thewordId, {
      value,
      gasLimit: gasLimit.add(10_000), // A 10,000 gas pad is used to avoid 'Out of gas' errors
    });
  };

  const settleOfferingHandler = () => {
    settleOffering();
  };

  const clearBidInput = () => {
    if (bidInputRef.current) {
      bidInputRef.current.value = '';
    }
  };

  // successful bid using redux store state
  useEffect(() => {
    if (!account) return;

    // tx state is mining
    const isMiningUserTx = placeBidState.status === 'Mining';
    // allows user to rebid against themselves so long as it is not the same tx
    const isCorrectTx = currentBid(bidInputRef).isEqualTo(new BigNumber(offering.amount.toString()));
    if (isMiningUserTx && offering.bidder === account && isCorrectTx) {
      placeBidState.status = 'Success';
      setModal({
        title: 'Success',
        message: `Bid was placed successfully!`,
        show: true,
      });
      setBidButtonContent({ loading: false, content: 'Bid' });
      clearBidInput();
    }
  }, [offering, placeBidState, account, setModal]);

  // placing bid transaction state hook
  useEffect(() => {
    switch (!offeringEnded && placeBidState.status) {
      case 'None':
        setBidButtonContent({
          loading: false,
          content: 'Bid',
        });
        break;
      case 'Mining':
        setBidButtonContent({ loading: true, content: '' });
        break;
      case 'Fail':
        setModal({
          title: 'Transaction Failed',
          message: placeBidState.errorMessage ? placeBidState.errorMessage : 'Please try again.',
          show: true,
        });
        setBidButtonContent({ loading: false, content: 'Bid' });
        break;
      case 'Exception':
        setModal({
          title: 'Error',
          message: placeBidState.errorMessage ? placeBidState.errorMessage : 'Please try again.',
          show: true,
        });
        setBidButtonContent({ loading: false, content: 'Bid' });
        break;
    }
  }, [placeBidState, offeringEnded, setModal]);

  // settle offering transaction state hook
  useEffect(() => {
    switch (offeringEnded && settleOfferingState.status) {
      case 'None':
        setBidButtonContent({
          loading: false,
          content: 'Settle Offering',
        });
        break;
      case 'Mining':
        setBidButtonContent({ loading: true, content: '' });
        break;
      case 'Success':
        setModal({
          title: 'Success',
          message: `Settled offering successfully!`,
          show: true,
        });
        setBidButtonContent({ loading: false, content: 'Settle Offering' });
        break;
      case 'Fail':
        setModal({
          title: 'Transaction Failed',
          message: settleOfferingState.errorMessage
            ? settleOfferingState.errorMessage
            : 'Please try again.',
          show: true,
        });
        setBidButtonContent({ loading: false, content: 'Settle Offering' });
        break;
      case 'Exception':
        setModal({
          title: 'Error',
          message: settleOfferingState.errorMessage
            ? settleOfferingState.errorMessage
            : 'Please try again.',
          show: true,
        });
        setBidButtonContent({ loading: false, content: 'Settle Offering' });
        break;
    }
  }, [settleOfferingState, offeringEnded, setModal]);

  if (!offering) return null;

  const isDisabled =
    placeBidState.status === 'Mining' || settleOfferingState.status === 'Mining' || !activeAccount;

  return (
    <>
      {!offeringEnded && (
        <p className={classes.minBidCopy}>{`Minimum bid: ${minBidEth(minBid)} ETH`}</p>
      )}
      <InputGroup>
        {!offeringEnded && (
          <>
            <FormControl
              aria-label="Example text with button addon"
              aria-describedby="basic-addon1"
              className={classes.bidInput}
              type="number"
              min="0"
              onChange={bidInputHandler}
              ref={bidInputRef}
              value={bidInput}
            />
            <span className={classes.customPlaceholder}>ETH</span>
          </>
        )}
        <Button
          className={offeringEnded ? classes.bidBtnOfferingEnded : classes.bidBtn}
          onClick={offeringEnded ? settleOfferingHandler : placeBidHandler}
          disabled={isDisabled}
        >
          {bidButtonContent.loading ? <Spinner animation="border" /> : bidButtonContent.content}
        </Button>
      </InputGroup>
    </>
  );
};
export default Bid;
