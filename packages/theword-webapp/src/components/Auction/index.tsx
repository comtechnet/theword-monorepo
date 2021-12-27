import { Col } from 'react-bootstrap';
import { StandaloneTheWordWithSeed } from '../StandaloneTheWord';
import AuctionActivity from '../AuctionActivity';
import { Row, Container } from 'react-bootstrap';
import { setStateBackgroundColor } from '../../state/slices/application';
import { LoadingTheWord } from '../TheWord';
import { Auction as IAuction } from '../../wrappers/thewordAuction';
import classes from './Auction.module.css';
import { Ithewordeed } from '../../wrappers/thewordToken';
import TheWordderTheWordContent from '../TheWordderTheWordContent';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { isTheWordderTheWord } from '../../utils/thewordderTheWord';
import {
  setNextOnDisplayAuctionTheWordId,
  setPrevOnDisplayAuctionTheWordId,
} from '../../state/slices/onDisplayAuction';
import { beige, grey } from '../../utils/thewordBgColors';

interface AuctionProps {
  auction?: IAuction;
}

const Auction: React.FC<AuctionProps> = props => {
  const { auction: currentAuction } = props;

  const history = useHistory();
  const dispatch = useAppDispatch();
  let stateBgColor = useAppSelector(state => state.application.stateBackgroundColor);
  const lastTheWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionTheWordId);

  const loadedTheWordHandler = (seed: Ithewordeed) => {
    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  };

  const prevAuctionHandler = () => {
    dispatch(setPrevOnDisplayAuctionTheWordId());
    currentAuction && history.push(`/auction/${currentAuction.thewordId.toNumber() - 1}`);
  };
  const nextAuctionHandler = () => {
    dispatch(setNextOnDisplayAuctionTheWordId());
    currentAuction && history.push(`/auction/${currentAuction.thewordId.toNumber() + 1}`);
  };

  const thewordContent = currentAuction && (
    <div className={classes.thewordWrapper}>
      <StandaloneTheWordWithSeed
        thewordId={currentAuction.thewordId}
        onLoadSeed={loadedTheWordHandler}
        shouldLinkToProfile={false}
      />
    </div>
  );

  const loadingTheWord = (
    <div className={classes.thewordWrapper}>
      <LoadingTheWord />
    </div>
  );

  const currentAuctionActivityContent = currentAuction && lastTheWordId && (
    <AuctionActivity
      auction={currentAuction}
      isFirstAuction={currentAuction.thewordId.eq(0)}
      isLastAuction={currentAuction.thewordId.eq(lastTheWordId)}
      onPrevAuctionClick={prevAuctionHandler}
      onNextAuctionClick={nextAuctionHandler}
      displayGraphDepComps={true}
    />
  );
  const thewordderTheWordContent = currentAuction && lastTheWordId && (
    <TheWordderTheWordContent
      mintTimestamp={currentAuction.startTime}
      thewordId={currentAuction.thewordId}
      isFirstAuction={currentAuction.thewordId.eq(0)}
      isLastAuction={currentAuction.thewordId.eq(lastTheWordId)}
      onPrevAuctionClick={prevAuctionHandler}
      onNextAuctionClick={nextAuctionHandler}
    />
  );

  return (
    <div style={{ backgroundColor: stateBgColor }}>
      <Container fluid="lg">
        <Row>
          <Col lg={{ span: 6 }} className={classes.thewordContentCol}>
            {currentAuction ? thewordContent : loadingTheWord}
          </Col>
          <Col lg={{ span: 6 }} className={classes.auctionActivityCol}>
            {currentAuction &&
              (isTheWordderTheWord(currentAuction.thewordId)
                ? thewordderTheWordContent
                : currentAuctionActivityContent)}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auction;
