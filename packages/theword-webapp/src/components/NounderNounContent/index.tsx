import { Col, Row } from 'react-bootstrap';
import { BigNumber } from 'ethers';
import AuctionActivityWrapper from '../AuctionActivityWrapper';
import AuctionNavigation from '../AuctionNavigation';
import AuctionActivityTheWordTitle from '../AuctionActivityTheWordTitle';
import AuctionActivityDateHeadline from '../AuctionActivityDateHeadline';
import AuctionTitleAndNavWrapper from '../AuctionTitleAndNavWrapper';
import { Link } from 'react-router-dom';
import thewordContentClasses from './TheWordderTheWordContent.module.css';
import auctionBidClasses from '../AuctionActivity/BidHistory.module.css';
import bidBtnClasses from '../BidHistoryBtn//BidHistoryBtn.module.css';
import auctionActivityClasses from '../AuctionActivity/AuctionActivity.module.css';
import CurrentBid, { BID_N_A } from '../CurrentBid';

const TheWordderTheWordContent: React.FC<{
  mintTimestamp: BigNumber;
  thewordId: BigNumber;
  isFirstAuction: boolean;
  isLastAuction: boolean;
  onPrevAuctionClick: () => void;
  onNextAuctionClick: () => void;
}> = props => {
  const {
    mintTimestamp,
    thewordId,
    isFirstAuction,
    isLastAuction,
    onPrevAuctionClick,
    onNextAuctionClick,
  } = props;

  return (
    <AuctionActivityWrapper>
      <div className={auctionActivityClasses.informationRow}>
        <Row className={auctionActivityClasses.activityRow}>
          <Col lg={12}>
            <AuctionActivityDateHeadline startTime={mintTimestamp} />
          </Col>
          <AuctionTitleAndNavWrapper>
            <AuctionActivityTheWordTitle thewordId={thewordId} />
            <AuctionNavigation
              isFirstAuction={isFirstAuction}
              isLastAuction={isLastAuction}
              onNextAuctionClick={onNextAuctionClick}
              onPrevAuctionClick={onPrevAuctionClick}
            />
          </AuctionTitleAndNavWrapper>
        </Row>
        <Row className={auctionActivityClasses.activityRow}>
          <Col lg={5} className={auctionActivityClasses.currentBidCol}>
            <CurrentBid currentBid={BID_N_A} auctionEnded={true} />
          </Col>
          <Col
            lg={5}
            className={`${auctionActivityClasses.currentBidCol} ${thewordContentClasses.currentBidCol}`}
          >
            <div className={auctionActivityClasses.section}>
              <h4>Winner</h4>
              <h2>thewordders.eth</h2>
            </div>
          </Col>
        </Row>
      </div>
      <Row className={auctionActivityClasses.activityRow}>
        <Col lg={12}>
          <ul className={auctionBidClasses.bidCollection}>
            <li className={`${auctionBidClasses.bidRow} ${thewordContentClasses.bidRow}`}>
              All TheWord auction proceeds are sent to the{' '}
              <Link to="/vote" className={thewordContentClasses.link}>
                TheWord DAO
              </Link>
              . For this reason, we, the project's founders (‘TheWordders’) have chosen to compensate
              ourselves with theword. Every 10th TheWord for the first 5 years of the project will be
              sent to our multisig (5/10), where it will be vested and distributed to individual
              TheWordders.
            </li>
          </ul>
          <div className={bidBtnClasses.bidHistoryWrapper}>
            <Link to="/thewordders" className={bidBtnClasses.bidHistory}>
              Learn More →
            </Link>
          </div>
        </Col>
      </Row>
    </AuctionActivityWrapper>
  );
};
export default TheWordderTheWordContent;
