import { Col } from 'react-bootstrap';
import Section from '../../layout/Section';
import { useAllProposals } from '../../wrappers/thewordDao';
import Proposals from '../../components/Proposals';
import classes from './Governance.module.css';

const GovernancePage = () => {
  const { data: proposals } = useAllProposals();

  return (
    <Section fullWidth={true}>
      <Col lg={{ span: 8, offset: 2 }}>
        <h1 className={classes.heading}>TheWord DAO Governance</h1>
        <p className={classes.subheading}>
          theword govern thewordDAO. theword can vote on proposals or delegate their vote to a third
          party. A minimum threshold of 1% of the total NOUN supply is required to submit proposals.
        </p>
        <Proposals proposals={proposals} />
      </Col>
    </Section>
  );
};
export default GovernancePage;
