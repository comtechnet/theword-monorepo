import { BigNumber } from 'ethers';
import Banner from '../../components/Banner';
import Auction from '../../components/Auction';
import Documentation from '../../components/Documentation';
import HistoryCollection from '../../components/HistoryCollection';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setOnDisplayAuctionTheWordId } from '../../state/slices/onDisplayAuction';
import { push } from 'connected-react-router';
import { thewordPath } from '../../utils/history';
import useOnDisplayAuction from '../../wrappers/onDisplayAuction';
import { useEffect } from 'react';

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: React.FC<AuctionPageProps> = props => {
  const { initialAuctionId } = props;
  const onDisplayAuction = useOnDisplayAuction();
  const lastAuctionTheWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionTheWordId);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastAuctionTheWordId) return;

    if (initialAuctionId !== undefined) {
      // handle out of bounds theword path ids
      if (initialAuctionId > lastAuctionTheWordId || initialAuctionId < 0) {
        dispatch(setOnDisplayAuctionTheWordId(lastAuctionTheWordId));
        dispatch(push(thewordPath(lastAuctionTheWordId)));
      } else {
        if (onDisplayAuction === undefined) {
          // handle regular theword path ids on first load
          dispatch(setOnDisplayAuctionTheWordId(initialAuctionId));
        }
      }
    } else {
      // no theword path id set
      if (lastAuctionTheWordId) {
        dispatch(setOnDisplayAuctionTheWordId(lastAuctionTheWordId));
      }
    }
  }, [lastAuctionTheWordId, dispatch, initialAuctionId, onDisplayAuction]);

  return (
    <>
      <Auction auction={onDisplayAuction} />
      <Banner />
      {lastAuctionTheWordId && (
        <HistoryCollection latestTheWordId={BigNumber.from(lastAuctionTheWordId)} historyCount={10} />
      )}
      <Documentation />
    </>
  );
};
export default AuctionPage;
