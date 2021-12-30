import { BigNumber } from 'ethers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const OfferingActivityDateHeadline: React.FC<{ startTime: BigNumber }> = props => {
  const { startTime } = props;
  const offeringStartTimeUTC = dayjs(startTime.toNumber() * 1000)
    .utc()
    .format('MMM DD YYYY');
  return <h4>{`${offeringStartTimeUTC}`}</h4>;
};

export default OfferingActivityDateHeadline;
