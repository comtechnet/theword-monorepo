import React from 'react';
import { Image } from 'react-bootstrap';
import classes from './TheWordInfoRowButton.module.css';

interface TheWordInfoRowButtonProps {
  iconImgSource: string;
  btnText: string;
  onClickHandler: () => void;
}

const TheWordInfoRowButton: React.FC<TheWordInfoRowButtonProps> = props => {
  const { iconImgSource, btnText, onClickHandler } = props;
  return (
    <div className={classes.thewordButton} onClick={onClickHandler}>
      <div className={classes.thewordButtonContents}>
        <Image src={iconImgSource} className={classes.buttonIcon} />
        {btnText}
      </div>
    </div>
  );
};

export default TheWordInfoRowButton;
