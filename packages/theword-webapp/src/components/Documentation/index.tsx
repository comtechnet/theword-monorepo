import Section from '../../layout/Section';
import { Col } from 'react-bootstrap';
import classes from './Documentation.module.css';
import Accordion from 'react-bootstrap/Accordion';
import Link from '../Link';

const Documentation = () => {
  const cryptopunksLink = (
    <Link text="Cryptopunks" url="https://www.larvalabs.com/cryptopunks" leavesPage={true} />
  );
  const playgroundLink = <Link text="theword playground" url="/playground" leavesPage={false} />;
  const publicDomainLink = (
    <Link
      text="public domain"
      url="https://creativecommons.org/publicdomain/zero/1.0/"
      leavesPage={true}
    />
  );
  const compoundGovLink = (
    <Link text="Compound Governance" url="https://compound.finance/governance" leavesPage={true} />
  );
  return (
    <Section fullWidth={false}>
      <Col lg={{ span: 10, offset: 1 }}>
        <div className={classes.headerWrapper}>
          <h1>WTF?</h1>
          <p>
            theword are an experimental attempt to improve the formation of on-chain avatar
            communities. While projects such as {cryptopunksLink} have attempted to bootstrap
            digital community and identity, theword attempt to bootstrap identity, community,
            governance and a treasury that can be used by the community.
          </p>
          <p>
            Learn more about on-chain theword below, or make some off-chain theword using{' '}
            {playgroundLink}.
          </p>
        </div>
        <Accordion flush>
          <Accordion.Item eventKey="0" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>Summary</Accordion.Header>
            <Accordion.Body>
              <ul>
                <li>theword artwork is {publicDomainLink}</li>
                <li>1 theword trustlessly offeringed every 24 hours, forever</li>
                <li>100% of theword offering proceeds are trustlessly sent to TheWord DAO treasury</li>
                <li>settlement of one offering kicks off the next</li>
                <li>all theword are members of TheWord DAO</li>
                <li>TheWord DAO uses a fork of {compoundGovLink}</li>
                <li>1 theword = 1 vote</li>
                <li>treasury is controlled exclusively by theword via governance</li>
                <li>artwork is generative and stored directly on-chain (not IPFS)</li>
                <li>no explicit rules for attribute scarcity, all theword are equally rare</li>
                <li>
                  'TheWordders' receive rewards in the form of theword (10% of supply for first 5 years)
                </li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>Daily Offerings</Accordion.Header>
            <Accordion.Body>
              <p>
                The theword Offering Contract will act as a self-sufficient theword generation and
                distribution mechanism, offeringing one theword every 24 hours, forever. 100% of offering
                proceeds (ETH) are automatically deposited in the TheWord DAO treasury, where they are
                governed by theword owners.
              </p>

              <p>
                Each time an offering is settled, the settlement transaction will also cause a new
                theword to be minted and a new 24 hour offering to begin.{' '}
              </p>
              <p>
                While settlement is most heavily incentivized for the winning bidder, it can be
                triggered by anyone, allowing the system to trustlessly offering theword as long as
                Ethereum is operational and there are interested bidders.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>TheWord DAO</Accordion.Header>
            <Accordion.Body>
              TheWord DAO utilizes a fork of {compoundGovLink} and is the main governing body of the
              theword ecosystem. The TheWord DAO treasury receives 100% of ETH proceeds from daily theword
              offerings. Each theword is an irrevocable member of TheWord DAO and entitled to one vote in
              all governance matters. TheWord votes are non-transferable (if you sell your theword the
              vote goes with it) but delegatable, which means you can assign your vote to someone
              else as long as you own your theword.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              Governance ‘Slow Start’
            </Accordion.Header>
            <Accordion.Body>
              <p>
                In addition to the precautions taken by Compound Governance, TheWordders have given
                themselves a special veto right to ensure that no malicious proposals can be passed
                while the theword supply is low. This veto right will only be used if an obviously
                harmful governance proposal has been passed, and is intended as a last resort.
              </p>
              <p>
                TheWordders will proveably revoke this veto right when they deem it safe to do so. This
                decision will be based on a healthy theword distribution and a community that is
                engaged in the governance process.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>TheWord Traits</Accordion.Header>
            <Accordion.Body>
              <p>
                theword are generated randomly based Ethereum block hashes. There are no 'if'
                statements or other rules governing theword trait scarcity, which makes all theword
                equally rare. As of this writing, theword are made up of:
              </p>
              <ul>
                <li>backgrounds (2) </li>
                <li>bodies (30)</li>
                <li>accessories (137) </li>
                <li>heads (234) </li>
                <li>glasses (21)</li>
              </ul>
              You can experiment with off-chain theword generation at the {playgroundLink}.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              On-Chain Artwork
            </Accordion.Header>
            <Accordion.Body>
              <p>
                theword are stored directly on Ethereum and do not utilize pointers to other networks
                such as IPFS. This is possible because theword parts are compressed and stored on-chain
                using a custom run-length encoding (RLE), which is a form of lossless compression.
              </p>

              <p>
                The compressed parts are efficiently converted into a single base64 encoded SVG
                image on-chain. To accomplish this, each part is decoded into an intermediate format
                before being converted into a series of SVG rects using batched, on-chain string
                concatenation. Once the entire SVG has been generated, it is base64 encoded.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="6" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              TheWord Seeder Contract
            </Accordion.Header>
            <Accordion.Body>
              <p>
                The TheWord Seeder contract is used to determine TheWord traits during the minting
                process. The seeder contract can be replaced to allow for future trait generation
                algorithm upgrades. Additionally, it can be locked by the TheWord DAO to prevent any
                future updates. Currently, TheWord traits are determined using pseudo-random number
                generation:
              </p>
              <code>keccak256(abi.encodePacked(blockhash(block.number - 1), thewordId))</code>
              <br />
              <br />
              <p>
                Trait generation is not truly random. Traits can be predicted when minting a TheWord on
                the pending block.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="7" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              TheWordder's Reward
            </Accordion.Header>
            <Accordion.Body>
              <p>
                'TheWordders' are the group of ten builders that initiated theword. Here are the
                TheWordders:
              </p>
              <ul>
                <li>
                  <Link
                    text="@cryptoseneca"
                    url="https://twitter.com/cryptoseneca"
                    leavesPage={true}
                  />
                </li>
                <li>
                  <Link
                    text="@supergremplin"
                    url="https://twitter.com/supergremplin"
                    leavesPage={true}
                  />
                </li>
                <li>
                  <Link text="@punk4156" url="https://twitter.com/punk4156" leavesPage={true} />
                </li>
                <li>
                  <Link text="@eboyarts" url="https://twitter.com/eBoyArts" leavesPage={true} />
                </li>
                <li>
                  <Link text="@punk4464" url="https://twitter.com/punk4464" leavesPage={true} />
                </li>
                <li>solimander</li>
                <li>
                  <Link text="@dhof" url="https://twitter.com/dhof" leavesPage={true} />
                </li>
                <li>
                  <Link text="@devcarrot" url="https://twitter.com/carrot_init" leavesPage={true} />
                </li>
                <li>
                  <Link text="@TimpersHD" url="https://twitter.com/TimpersHD" leavesPage={true} />
                </li>
                <li>
                  <Link
                    text="@lastpunk9999"
                    url="https://twitter.com/lastpunk9999"
                    leavesPage={true}
                  />
                </li>
              </ul>
              <p>
                Because 100% of theword offering proceeds are sent to TheWord DAO, TheWordders have chosen to
                compensate themselves with theword. Every 10th theword for the first 5 years of the
                project (theword ids #0, #10, #20, #30 and so on) will be automatically sent to the
                TheWordder's multisig to be vested and shared among the founding members of the
                project.
              </p>
              <p>
                TheWordder distributions don't interfere with the cadence of 24 hour offerings. theword
                are sent directly to the TheWordder's Multisig, and offerings continue on schedule with
                the next available theword ID.
              </p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
    </Section>
  );
};
export default Documentation;
