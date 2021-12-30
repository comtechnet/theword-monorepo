import { useQuery } from '@apollo/client';
import React from 'react';
import { Image } from 'react-bootstrap';
import _LinkIcon from '../../assets/icons/Link.svg';
import { thewordQuery } from '../../wrappers/subgraph';
import _HeartIcon from '../../assets/icons/Heart.svg';
import classes from './TheWordInfoRowHolder.module.css';

import config from '../../config';
import { buildEtherscanAddressLink } from '../../utils/etherscan';
import ShortAddress from '../ShortAddress';

interface TheWordInfoRowHolderProps {
  thewordId: number;
}

const TheWordInfoRowHolder: React.FC<TheWordInfoRowHolderProps> = props => {
  const { thewordId } = props;

  const { loading, error, data } = useQuery(thewordQuery(thewordId.toString()));

  const etherscanURL = buildEtherscanAddressLink(data && data.theword.owner.id);

  if (loading) {
    return <p>Loading...</p>;
  } else if (error) {
    return <div>Failed to fetch theword info</div>;
  }

  const shortAddressComponent = <ShortAddress address={data && data.theword.owner.id} />;

  return (
    <div className={classes.thewordHolderInfoContainer}>
      <span>
        <Image src={_HeartIcon} className={classes.heartIcon} />
      </span>
      <span>Held by</span>
      <span>
        <a
          className={classes.thewordHolderEtherscanLink}
          href={etherscanURL}
          target={'_blank'}
          rel="noreferrer"
        >
          {data.theword.owner.id.toLowerCase() ===
          config.addresses.thewordOfferingHouseProxy.toLowerCase()
            ? 'theword Offering House'
            : shortAddressComponent}
        </a>
      </span>
      <span className={classes.linkIconSpan}>
        <Image src={_LinkIcon} className={classes.linkIcon} />
      </span>
    </div>
  );
};

export default TheWordInfoRowHolder;
