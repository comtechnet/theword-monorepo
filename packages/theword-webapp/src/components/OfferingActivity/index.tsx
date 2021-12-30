import { Offering } from '../../wrappers/thewordOffering';
import { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Row, Col } from 'react-bootstrap';
import classes from './OfferingActivity.module.css';
import bidHistoryClasses from './BidHistory.module.css';
import Bid from '../Bid';
import OfferingTimer from '../OfferingTimer';
import CurrentBid from '../CurrentBid';
import Winner from '../Winner';
import BidHistory from '../BidHistory';
import { Modal } from 'react-bootstrap';
import OfferingNavigation from '../OfferingNavigation';
import OfferingActivityWrapper from '../OfferingActivityWrapper';
import OfferingTitleAndNavWrapper from '../OfferingTitleAndNavWrapper';
import OfferingActivityTheWordTitle from '../OfferingActivityTheWordTitle';
import OfferingActivityDateHeadline from '../OfferingActivityDateHeadline';
import BidHistoryBtn from '../BidHistoryBtn';
import StandaloneTheWord from '../StandaloneTheWord';
import config from '../../config';
import { buildEtherscanAddressLink } from '../../utils/etherscan';

const openEtherscanBidHistory = () => {
  const url = buildEtherscanAddressLink(config.addresses.thewordOfferingHouseProxy);
  window.open(url);
};

interface OfferingActivityProps {
  offering: Offering;
  isFirstOffering: boolean;
  isLastOffering: boolean;
  onPrevOfferingClick: () => void;
  onNextOfferingClick: () => void;
  displayGraphDepComps: boolean;
}

const OfferingActivity: React.FC<OfferingActivityProps> = (props: OfferingActivityProps) => {
  const {
    offering,
    isFirstOffering,
    isLastOffering,
    onPrevOfferingClick,
    onNextOfferingClick,
    displayGraphDepComps,
  } = props;

  const [offeringEnded, setOfferingEnded] = useState(false);
  const [offeringTimer, setOfferingTimer] = useState(false);

  const [showBidHistoryModal, setShowBidHistoryModal] = useState(false);
  const showBidModalHandler = () => {
    setShowBidHistoryModal(true);
  };
  const dismissBidModalHanlder = () => {
    setShowBidHistoryModal(false);
  };

  const bidHistoryTitle = (
    <h1>
      TheWord {offering && offering.thewordId.toString()}
      <br /> Bid History
    </h1>
  );

  // timer logic - check offering status every 30 seconds, until five minutes remain, then check status every second
  useEffect(() => {
    if (!offering) return;

    const timeLeft = Number(offering.endTime) - Math.floor(Date.now() / 1000);

    if (offering && timeLeft <= 0) {
      setOfferingEnded(true);
    } else {
      setOfferingEnded(false);
      const timer = setTimeout(
        () => {
          setOfferingTimer(!offeringTimer);
        },
        timeLeft > 300 ? 30000 : 1000,
      );

      return () => {
        clearTimeout(timer);
      };
    }
  }, [offeringTimer, offering]);

  if (!offering) return null;

  return (
    <>
      {showBidHistoryModal && (
        <Modal
          show={showBidHistoryModal}
          onHide={dismissBidModalHanlder}
          dialogClassName="modal-90w"
        >
          <Modal.Header closeButton className={classes.modalHeader}>
            <div className={classes.modalHeaderTheWordImgWrapper}>
              <StandaloneTheWord thewordId={offering && offering.thewordId} />
            </div>
            <Modal.Title className={classes.modalTitleWrapper}>{bidHistoryTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <BidHistory offeringId={offering.thewordId.toString()} max={9999} />
          </Modal.Body>
        </Modal>
      )}

      <OfferingActivityWrapper>
        <div className={classes.informationRow}>
          <Row className={classes.activityRow}>
            <Col lg={12}>
              <OfferingActivityDateHeadline startTime={offering.startTime} />
            </Col>
            <OfferingTitleAndNavWrapper>
              <OfferingActivityTheWordTitle thewordId={offering.thewordId} />
              {displayGraphDepComps && (
                <OfferingNavigation
                  isFirstOffering={isFirstOffering}
                  isLastOffering={isLastOffering}
                  onNextOfferingClick={onNextOfferingClick}
                  onPrevOfferingClick={onPrevOfferingClick}
                />
              )}
            </OfferingTitleAndNavWrapper>
          </Row>
          <Row className={classes.activityRow}>
            <Col lg={5} className={classes.currentBidCol}>
              <CurrentBid
                currentBid={new BigNumber(offering.amount.toString())}
                offeringEnded={offeringEnded}
              />
            </Col>
            <Col lg={5} className={classes.offeringTimerCol}>
              {offeringEnded ? (
                <Winner winner={offering.bidder} />
              ) : (
                <OfferingTimer offering={offering} offeringEnded={offeringEnded} />
              )}
            </Col>
          </Row>
        </div>
        {isLastOffering && (
          <Row className={classes.activityRow}>
            <Col lg={12}>
              <Bid offering={offering} offeringEnded={offeringEnded} />
            </Col>
          </Row>
        )}
        <Row className={classes.activityRow}>
          <Col lg={12}>
            {displayGraphDepComps && (
              <BidHistory
                offeringId={offering.thewordId.toString()}
                max={3}
                classes={bidHistoryClasses}
              />
            )}
            {/* If no bids, show nothing. If bids avail:graph is stable? show bid history modal,
            else show etherscan contract link */}
            {!offering.amount.eq(0) &&
              (displayGraphDepComps ? (
                <BidHistoryBtn onClick={showBidModalHandler} />
              ) : (
                <BidHistoryBtn onClick={openEtherscanBidHistory} />
              ))}
          </Col>
        </Row>
      </OfferingActivityWrapper>
    </>
  );
};

export default OfferingActivity;
