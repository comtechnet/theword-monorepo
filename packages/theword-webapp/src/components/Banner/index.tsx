import classes from './Banner.module.css';
import Section from '../../layout/Section';
import { Col } from 'react-bootstrap';
import calendar_theword from '../../assets/calendar_theword.png';
import TheWord from '../TheWord';

const Banner = () => {
  return (
    <Section fullWidth={false} className={classes.bannerSection}>
      <Col lg={6}>
        <div className={classes.wrapper}>
          <h1>
            ONE THEWORD,
            <br />
            EVERY DAY,
            <br />
            FOREVER.
          </h1>
        </div>
      </Col>
      <Col lg={6}>
        <div style={{ padding: '2rem' }}>
          <TheWord imgPath={calendar_theword} alt="theword" />
        </div>
      </Col>
    </Section>
  );
};

export default Banner;
