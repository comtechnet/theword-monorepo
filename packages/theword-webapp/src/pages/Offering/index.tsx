import { BigNumber } from 'ethers';
import Banner from '../../components/Banner';
import Offering from '../../components/Offering';
import Documentation from '../../components/Documentation';
import HistoryCollection from '../../components/HistoryCollection';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setOnDisplayOfferingTheWordId } from '../../state/slices/onDisplayOffering';
import { push } from 'connected-react-router';
import { thewordPath } from '../../utils/history';
import useOnDisplayOffering from '../../wrappers/onDisplayOffering';
import { useEffect } from 'react';

interface OfferingPageProps {
  initialOfferingId?: number;
}

const OfferingPage: React.FC<OfferingPageProps> = props => {
  const { initialOfferingId } = props;
  const onDisplayOffering = useOnDisplayOffering();
  const lastOfferingTheWordId = useAppSelector(state => state.onDisplayOffering.lastOfferingTheWordId);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastOfferingTheWordId) return;

    if (initialOfferingId !== undefined) {
      // handle out of bounds theword path ids
      if (initialOfferingId > lastOfferingTheWordId || initialOfferingId < 0) {
        dispatch(setOnDisplayOfferingTheWordId(lastOfferingTheWordId));
        dispatch(push(thewordPath(lastOfferingTheWordId)));
      } else {
        if (onDisplayOffering === undefined) {
          // handle regular theword path ids on first load
          dispatch(setOnDisplayOfferingTheWordId(initialOfferingId));
        }
      }
    } else {
      // no theword path id set
      if (lastOfferingTheWordId) {
        dispatch(setOnDisplayOfferingTheWordId(lastOfferingTheWordId));
      }
    }
  }, [lastOfferingTheWordId, dispatch, initialOfferingId, onDisplayOffering]);

  return (
    <>
      <Offering offering={onDisplayOffering} />
      <Banner />
      {lastOfferingTheWordId && (
        <HistoryCollection latestTheWordId={BigNumber.from(lastOfferingTheWordId)} historyCount={10} />
      )}
      <Documentation />
    </>
  );
};
export default OfferingPage;
