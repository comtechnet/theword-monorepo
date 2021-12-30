import classes from './OfferingActivityWrapper.module.css';

const OfferingActivityWrapper: React.FC<{}> = props => {
  return <div className={classes.wrapper}>{props.children}</div>;
};
export default OfferingActivityWrapper;
