import { BigNumber } from 'ethers';
import classes from './AuctionActivityTheWordTitle.module.css';

const AuctionActivityTheWordTitle: React.FC<{ thewordId: BigNumber }> = props => {
  const { thewordId } = props;
  const thewordIdContent = `TheWord ${thewordId.toString()}`;
  return (
    <div className={classes.wrapper}>
      <h1>{thewordIdContent}</h1>
    </div>
  );
};
export default AuctionActivityTheWordTitle;
