import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Offering } from '../../wrappers/thewordOffering';
import classes from './OfferingTimer.module.css';
import { useState, useEffect, useRef } from 'react';

dayjs.extend(duration);

const OfferingTimer: React.FC<{
  offering: Offering;
  offeringEnded: boolean;
}> = props => {
  const { offering, offeringEnded } = props;

  const [offeringTimer, setOfferingTimer] = useState(0);
  const [timerToggle, setTimerToggle] = useState(true);
  const offeringTimerRef = useRef(offeringTimer); // to access within setTimeout
  offeringTimerRef.current = offeringTimer;

  const timerDuration = dayjs.duration(offeringTimerRef.current, 's');
  const endTime = dayjs().add(offeringTimerRef.current, 's').local();

  // timer logic
  useEffect(() => {
    const timeLeft = (offering && Number(offering.endTime)) - dayjs().unix();

    setOfferingTimer(offering && timeLeft);

    if (offering && timeLeft <= 0) {
      setOfferingTimer(0);
    } else {
      const timer = setTimeout(() => {
        setOfferingTimer(offeringTimerRef.current - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [offering, offeringTimer]);

  const offeringContent = offeringEnded
    ? 'Offering ended'
    : timerToggle
    ? 'Ends in'
    : `Ends on ${endTime.format('MMM Do')} at`;

  const flooredMinutes = Math.floor(timerDuration.minutes());
  const flooredSeconds = Math.floor(timerDuration.seconds());

  if (!offering) return null;

  return (
    <div onClick={() => setTimerToggle(!timerToggle)} className={classes.offeringTimerSection}>
      <h4 className={classes.title}>{offeringContent}</h4>
      {timerToggle ? (
        <h2 className={classes.timerWrapper}>
          <div className={classes.timerSection}>
            <span>
              {`${Math.floor(timerDuration.hours())}`}
              <span className={classes.small}>h</span>
            </span>
          </div>
          <div className={classes.timerSection}>
            <span>
              {`${flooredMinutes}`}
              <span className={classes.small}>m</span>
            </span>
          </div>
          <div className={classes.timerSection}>
            <span>
              {`${flooredSeconds}`}
              <span className={classes.small}>s</span>
            </span>
          </div>
        </h2>
      ) : (
        <h2 className={classes.timerWrapper}>
          <div className={classes.clockSection}>
            <span>{endTime.format('h:mm:ss a')}</span>
          </div>
        </h2>
      )}
    </div>
  );
};

export default OfferingTimer;
