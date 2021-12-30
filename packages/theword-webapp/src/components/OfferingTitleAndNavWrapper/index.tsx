import { Col } from 'react-bootstrap';
import classes from './OfferingTitleAndNavWrapper.module.css';

const OfferingTitleAndNavWrapper: React.FC<{}> = props => {
  return (
    <Col lg={12} className={classes.offeringTitleAndNavContainer}>
      {props.children}
    </Col>
  );
};
export default OfferingTitleAndNavWrapper;
