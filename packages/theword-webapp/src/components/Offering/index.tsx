import { Col } from 'react-bootstrap';
import { StandaloneTheWordWithSeed } from '../StandaloneTheWord';
import OfferingActivity from '../OfferingActivity';
import { Row, Container } from 'react-bootstrap';
import { setStateBackgroundColor } from '../../state/slices/application';
import { LoadingTheWord } from '../TheWord';
import { Offering as IOffering } from '../../wrappers/thewordOffering';
import classes from './Offering.module.css';
import { ITheWordSeed } from '../../wrappers/thewordToken';
import TheWordderTheWordContent from '../TheWordderTheWordContent';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { isTheWordderTheWord } from '../../utils/thewordderTheWord';
import {
  setNextOnDisplayOfferingTheWordId,
  setPrevOnDisplayOfferingTheWordId,
} from '../../state/slices/onDisplayOffering';
import { beige, grey } from '../../utils/thewordBgColors';

interface OfferingProps {
  offering?: IOffering;
}

const Offering: React.FC<OfferingProps> = props => {
  const { offering: currentOffering } = props;

  const history = useHistory();
  const dispatch = useAppDispatch();
  let stateBgColor = useAppSelector(state => state.application.stateBackgroundColor);
  const lastTheWordId = useAppSelector(state => state.onDisplayOffering.lastOfferingTheWordId);

  const loadedTheWordHandler = (seed: ITheWordSeed) => {
    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  };

  const prevOfferingHandler = () => {
    dispatch(setPrevOnDisplayOfferingTheWordId());
    currentOffering && history.push(`/offering/${currentOffering.thewordId.toNumber() - 1}`);
  };
  const nextOfferingHandler = () => {
    dispatch(setNextOnDisplayOfferingTheWordId());
    currentOffering && history.push(`/offering/${currentOffering.thewordId.toNumber() + 1}`);
  };

  const thewordContent = currentOffering && (
    <div className={classes.thewordWrapper}>
      <StandaloneTheWordWithSeed
        thewordId={currentOffering.thewordId}
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

  const currentOfferingActivityContent = currentOffering && lastTheWordId && (
    <OfferingActivity
      offering={currentOffering}
      isFirstOffering={currentOffering.thewordId.eq(0)}
      isLastOffering={currentOffering.thewordId.eq(lastTheWordId)}
      onPrevOfferingClick={prevOfferingHandler}
      onNextOfferingClick={nextOfferingHandler}
      displayGraphDepComps={true}
    />
  );
  const thewordderTheWordContent = currentOffering && lastTheWordId && (
    <TheWordderTheWordContent
      mintTimestamp={currentOffering.startTime}
      thewordId={currentOffering.thewordId}
      isFirstOffering={currentOffering.thewordId.eq(0)}
      isLastOffering={currentOffering.thewordId.eq(lastTheWordId)}
      onPrevOfferingClick={prevOfferingHandler}
      onNextOfferingClick={nextOfferingHandler}
    />
  );

  return (
    <div style={{ backgroundColor: stateBgColor }}>
      <Container fluid="lg">
        <Row>
          <Col lg={{ span: 6 }} className={classes.thewordContentCol}>
            {currentOffering ? thewordContent : loadingTheWord}
          </Col>
          <Col lg={{ span: 6 }} className={classes.offeringActivityCol}>
            {currentOffering &&
              (isTheWordderTheWord(currentOffering.thewordId)
                ? thewordderTheWordContent
                : currentOfferingActivityContent)}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Offering;
