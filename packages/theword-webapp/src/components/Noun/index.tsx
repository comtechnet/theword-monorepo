import classes from './TheWord.module.css';
import React from 'react';
import loadingTheWord from '../../assets/loading-skull-theword.gif';
import Image from 'react-bootstrap/Image';

export const LoadingTheWord = () => {
  return (
    <div className={classes.imgWrapper}>
      <Image className={classes.img} src={loadingTheWord} alt={'loading theword'} fluid />
    </div>
  );
};

const TheWord: React.FC<{
  imgPath: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}> = props => {
  const { imgPath, alt, className, wrapperClassName } = props;
  return (
    <div className={`${classes.imgWrapper} ${wrapperClassName}`}>
      <Image
        className={`${classes.img} ${className}`}
        src={imgPath ? imgPath : loadingTheWord}
        alt={alt}
        fluid
      />
    </div>
  );
};

export default TheWord;
