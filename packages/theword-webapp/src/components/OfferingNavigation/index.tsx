import React from 'react';
import classes from './OfferingNavigation.module.css';

const OfferingNavigation: React.FC<{
  isFirstOffering: boolean;
  isLastOffering: boolean;
  onPrevOfferingClick: () => void;
  onNextOfferingClick: () => void;
}> = props => {
  const { isFirstOffering, isLastOffering, onPrevOfferingClick, onNextOfferingClick } = props;
  return (
    <div className={classes.navArrowsContainer}>
      <button
        onClick={() => onPrevOfferingClick()}
        className={classes.leftArrow}
        disabled={isFirstOffering}
      >
        ←
      </button>
      <button
        onClick={() => onNextOfferingClick()}
        className={classes.rightArrow}
        disabled={isLastOffering}
      >
        →
      </button>
    </div>
  );
};
export default OfferingNavigation;
