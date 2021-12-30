import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChainId, DAppProvider } from '@usedapp/core';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import account from './state/slices/account';
import application from './state/slices/application';
import logs from './state/slices/logs';
import offering, {
  reduxSafeOffering,
  reduxSafeNewOffering,
  reduxSafeBid,
  setActiveOffering,
  setOfferingExtended,
  setOfferingSettled,
  setFullOffering,
} from './state/slices/offering';
import onDisplayOffering, {
  setLastOfferingTheWordId,
  setOnDisplayOfferingTheWordId,
} from './state/slices/onDisplayOffering';
import { ApolloProvider, useQuery } from '@apollo/client';
import { clientFactory, latestOfferingsQuery } from './wrappers/subgraph';
import { useEffect } from 'react';
import pastOfferings, { addPastOfferings } from './state/slices/pastOfferings';
import LogsUpdater from './state/updaters/logs';
import config, { CHAIN_ID, createNetworkHttpUrl } from './config';
import { WebSocketProvider } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';
import { TheWordOfferingHouseFactory } from '@theword/sdk';
import dotenv from 'dotenv';
import { useAppDispatch, useAppSelector } from './hooks';
import { appendBid } from './state/slices/offering';
import { ConnectedRouter, connectRouter } from 'connected-react-router';
import { createBrowserHistory, History } from 'history';
import { applyMiddleware, createStore, combineReducers, PreloadedState } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { thewordPath } from './utils/history';
import { push } from 'connected-react-router';

dotenv.config();

export const history = createBrowserHistory();

const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    account,
    application,
    offering,
    logs,
    pastOfferings,
    onDisplayOffering,
  });

export default function configureStore(preloadedState: PreloadedState<any>) {
  const store = createStore(
    createRootReducer(history), // root reducer with router state
    preloadedState,
    composeWithDevTools(
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        // ... other middlewares ...
      ),
    ),
  );

  return store;
}

const store = configureStore({});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// prettier-ignore
const useDappConfig = {
  readOnlyChainId: CHAIN_ID,
  readOnlyUrls: {
    [ChainId.Rinkeby]: createNetworkHttpUrl('rinkeby'),
    [ChainId.Mainnet]: createNetworkHttpUrl('mainnet'),
    [ChainId.Hardhat]: 'http://localhost:8545',
  },
};

const client = clientFactory(config.app.subgraphApiUri);

const Updaters = () => {
  return (
    <>
      <LogsUpdater />
    </>
  );
};

const BLOCKS_PER_DAY = 6_500;

const ChainSubscriber: React.FC = () => {
  const dispatch = useAppDispatch();

  const loadState = async () => {
    const wsProvider = new WebSocketProvider(config.app.wsRpcUri);
    const thewordOfferingHouseContract = TheWordOfferingHouseFactory.connect(
      config.addresses.thewordOfferingHouseProxy,
      wsProvider,
    );

    const bidFilter = thewordOfferingHouseContract.filters.OfferingBid(null, null, null, null);
    const extendedFilter = thewordOfferingHouseContract.filters.OfferingExtended(null, null);
    const createdFilter = thewordOfferingHouseContract.filters.OfferingCreated(null, null, null);
    const settledFilter = thewordOfferingHouseContract.filters.OfferingSettled(null, null, null);
    const processBidFilter = async (
      thewordId: BigNumberish,
      sender: string,
      value: BigNumberish,
      extended: boolean,
      event: any,
    ) => {
      const timestamp = (await event.getBlock()).timestamp;
      const transactionHash = event.transactionHash;
      dispatch(
        appendBid(reduxSafeBid({ thewordId, sender, value, extended, transactionHash, timestamp })),
      );
    };
    const processOfferingCreated = (
      thewordId: BigNumberish,
      startTime: BigNumberish,
      endTime: BigNumberish,
    ) => {
      dispatch(
        setActiveOffering(reduxSafeNewOffering({ thewordId, startTime, endTime, settled: false })),
      );
      const thewordIdNumber = BigNumber.from(thewordId).toNumber();
      dispatch(push(thewordPath(thewordIdNumber)));
      dispatch(setOnDisplayOfferingTheWordId(thewordIdNumber));
      dispatch(setLastOfferingTheWordId(thewordIdNumber));
    };
    const processOfferingExtended = (thewordId: BigNumberish, endTime: BigNumberish) => {
      dispatch(setOfferingExtended({ thewordId, endTime }));
    };
    const processOfferingSettled = (thewordId: BigNumberish, winner: string, amount: BigNumberish) => {
      dispatch(setOfferingSettled({ thewordId, amount, winner }));
    };

    // Fetch the current offering
    const currentOffering = await thewordOfferingHouseContract.offering();
    dispatch(setFullOffering(reduxSafeOffering(currentOffering)));
    dispatch(setLastOfferingTheWordId(currentOffering.thewordId.toNumber()));

    // Fetch the previous 24hours of  bids
    const previousBids = await thewordOfferingHouseContract.queryFilter(bidFilter, 0 - BLOCKS_PER_DAY);
    for (let event of previousBids) {
      if (event.args === undefined) return;
      processBidFilter(...(event.args as [BigNumber, string, BigNumber, boolean]), event);
    }

    thewordOfferingHouseContract.on(bidFilter, (thewordId, sender, value, extended, event) =>
      processBidFilter(thewordId, sender, value, extended, event),
    );
    thewordOfferingHouseContract.on(createdFilter, (thewordId, startTime, endTime) =>
      processOfferingCreated(thewordId, startTime, endTime),
    );
    thewordOfferingHouseContract.on(extendedFilter, (thewordId, endTime) =>
      processOfferingExtended(thewordId, endTime),
    );
    thewordOfferingHouseContract.on(settledFilter, (thewordId, winner, amount) =>
      processOfferingSettled(thewordId, winner, amount),
    );
  };
  loadState();

  return <></>;
};

const PastOfferings: React.FC = () => {
  const latestOfferingId = useAppSelector(state => state.onDisplayOffering.lastOfferingTheWordId);
  const { data } = useQuery(latestOfferingsQuery());
  const dispatch = useAppDispatch();

  useEffect(() => {
    data && dispatch(addPastOfferings({ data }));
  }, [data, latestOfferingId, dispatch]);

  return <></>;
};

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ChainSubscriber />
      <React.StrictMode>
        <Web3ReactProvider
          getLibrary={
            provider => new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
          }
        >
          <ApolloProvider client={client}>
            <PastOfferings />
            <DAppProvider config={useDappConfig}>
              <App />
              <Updaters />
            </DAppProvider>
          </ApolloProvider>
        </Web3ReactProvider>
      </React.StrictMode>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
