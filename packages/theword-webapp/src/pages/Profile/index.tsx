import { BigNumber } from 'ethers';
import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { StandaloneTheWordWithSeed } from '../../components/StandaloneTheWord';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setStateBackgroundColor } from '../../state/slices/application';
import { grey, beige } from '../../utils/thewordBgColors';
import { ITheWordSeed } from '../../wrappers/thewordToken';

import classes from './Profile.module.css';

import TheWordInfoCard from '../../components/TheWordInfoCard';
import ProfileActivityFeed from '../../components/ProfileActivityFeed';

interface ProfilePageProps {
  thewordId: number;
}

const ProfilePage: React.FC<ProfilePageProps> = props => {
  const { thewordId } = props;

  const dispatch = useAppDispatch();
  const lastOfferingTheWordId = useAppSelector(
    state => state.onDisplayOffering.lastOfferingTheWordId,
  );
  let stateBgColor = useAppSelector(state => state.application.stateBackgroundColor);

  const loadedTheWordHandler = (seed: ITheWordSeed) => {
    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  };

  if (!lastOfferingTheWordId) {
    return <></>;
  }

  const thewordIdForDisplay = Math.min(thewordId, lastOfferingTheWordId);

  const thewordContent = (
    <StandaloneTheWordWithSeed
      thewordId={BigNumber.from(thewordIdForDisplay)}
      onLoadSeed={loadedTheWordHandler}
      shouldLinkToProfile={false}
    />
  );

  return (
    <>
      <div style={{ backgroundColor: stateBgColor }}>
        <Container>
          <Row>
            <Col lg={6}>{thewordContent}</Col>
            <Col lg={6} className={classes.thewordProfileInfo}>
              <TheWordInfoCard thewordId={thewordIdForDisplay} />
            </Col>
          </Row>
        </Container>
      </div>
      <ProfileActivityFeed thewordId={thewordIdForDisplay} />
    </>
  );
};

export default ProfilePage;
