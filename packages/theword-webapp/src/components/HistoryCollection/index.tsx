import { BigNumber, BigNumberish } from 'ethers';
import Section from '../../layout/Section';
import classes from './HistoryCollection.module.css';
import clsx from 'clsx';
import StandaloneTheWord from '../StandaloneTheWord';
import { LoadingTheWord } from '../TheWord';
import config from '../../config';
import { Container, Row } from 'react-bootstrap';

interface HistoryCollectionProps {
  historyCount: number;
  latestTheWordId: BigNumberish;
}

const HistoryCollection: React.FC<HistoryCollectionProps> = (props: HistoryCollectionProps) => {
  const { historyCount, latestTheWordId } = props;

  if (!latestTheWordId) return null;

  const startAtZero = BigNumber.from(latestTheWordId).sub(historyCount).lt(0);

  let thewordIds: Array<BigNumber | null> = new Array(historyCount);
  thewordIds = thewordIds.fill(null).map((_, i) => {
    if (BigNumber.from(i).lt(latestTheWordId)) {
      const index = startAtZero
        ? BigNumber.from(0)
        : BigNumber.from(Number(latestTheWordId) - historyCount);
      return index.add(i);
    } else {
      return null;
    }
  });

  const thewordContent = thewordIds.map((thewordId, i) => {
    return !thewordId ? <LoadingTheWord key={i} /> : <StandaloneTheWord key={i} thewordId={thewordId} />;
  });

  return (
    <Section fullWidth={true}>
      <Container fluid>
        <Row className="justify-content-md-center">
          <div className={clsx(classes.historyCollection)}>
            {config.app.enableHistory && thewordContent}
          </div>
        </Row>
      </Container>
    </Section>
  );
};

export default HistoryCollection;
