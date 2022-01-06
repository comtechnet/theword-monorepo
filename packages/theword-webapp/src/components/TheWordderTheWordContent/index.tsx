import { Col, Row } from 'react-bootstrap';
import { BigNumber } from 'ethers';
import OfferingActivityWrapper from '../OfferingActivityWrapper';
import OfferingNavigation from '../OfferingNavigation';
import OfferingActivityTheWordTitle from '../OfferingActivityTheWordTitle';
import OfferingActivityDateHeadline from '../OfferingActivityDateHeadline';
import OfferingTitleAndNavWrapper from '../OfferingTitleAndNavWrapper';
import { Link } from 'react-router-dom';
import thewordContentClasses from './TheWordderTheWordContent.module.css';
import offeringBidClasses from '../OfferingActivity/BidHistory.module.css';
import bidBtnClasses from '../BidHistoryBtn//BidHistoryBtn.module.css';
import offeringActivityClasses from '../OfferingActivity/OfferingActivity.module.css';
import CurrentBid, { BID_N_A } from '../CurrentBid';

const TheWordderTheWordContent: React.FC<{
  mintTimestamp: BigNumber;
  thewordId: BigNumber;
  isFirstOffering: boolean;
  isLastOffering: boolean;
  onPrevOfferingClick: () => void;
  onNextOfferingClick: () => void;
}> = props => {
  const {
    mintTimestamp,
    thewordId,
    isFirstOffering,
    isLastOffering,
    onPrevOfferingClick,
    onNextOfferingClick,
  } = props;

  return (
    <OfferingActivityWrapper>
      <div className={offeringActivityClasses.informationRow}>
        <Row className={offeringActivityClasses.activityRow}>
          <Col lg={12}>
            <OfferingActivityDateHeadline startTime={mintTimestamp} />
          </Col>
          <OfferingTitleAndNavWrapper>
            <OfferingActivityTheWordTitle thewordId={thewordId} />
            <OfferingNavigation
              isFirstOffering={isFirstOffering}
              isLastOffering={isLastOffering}
              onNextOfferingClick={onNextOfferingClick}
              onPrevOfferingClick={onPrevOfferingClick}
            />
          </OfferingTitleAndNavWrapper>
        </Row>
        <Row className={offeringActivityClasses.activityRow}>
          <Col lg={5} className={offeringActivityClasses.currentBidCol}>
            <CurrentBid currentBid={BID_N_A} offeringEnded={true} />
          </Col>
          <Col
            lg={5}
            className={`${offeringActivityClasses.currentBidCol} ${thewordContentClasses.currentBidCol}`}
          >
            <div className={offeringActivityClasses.section}>
              <h4>Winner</h4>
              <h2>thewordders.eth</h2>
            </div>
          </Col>
        </Row>
      </div>
      <Row className={offeringActivityClasses.activityRow}>
        <Col lg={12}>
          <ul className={offeringBidClasses.bidCollection}>
            <li className={`${offeringBidClasses.bidRow} ${thewordContentClasses.bidRow}`}>
              All TheWord offering proceeds are sent to the{' '}
              <Link to="/vote" className={thewordContentClasses.link}>
                TheWord DAO
              </Link>
              . For this reason, we, the project's founders (‘TheWordders’) have chosen to
              compensate ourselves with theword. Every 10th TheWord for the first 5 years of the
              project will be sent to our multisig (5/10), where it will be vested and distributed
              to individual TheWordders.
            </li>
          </ul>
          <div className={bidBtnClasses.bidHistoryWrapper}>
            <Link to="/thewordders" className={bidBtnClasses.bidHistory}>
              Learn More →
            </Link>
          </div>
        </Col>
      </Row>
    </OfferingActivityWrapper>
  );
};
export default TheWordderTheWordContent;
