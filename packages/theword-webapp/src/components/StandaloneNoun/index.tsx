import { ImageData as data, getNounData } from '@theword/assets';
import { buildSVG } from '@theword/sdk';
import { BigNumber as EthersBN } from 'ethers';
import { Ithewordeed, usethewordeed } from '../../wrappers/nounToken';
import Noun from '../Noun';
import { Link } from 'react-router-dom';
import classes from './StandaloneNoun.module.css';

interface StandaloneNounProps {
  nounId: EthersBN;
}

interface StandaloneNounWithSeedProps {
  nounId: EthersBN;
  onLoadSeed?: (seed: Ithewordeed) => void;
  shouldLinkToProfile: boolean;
}

const getNoun = (nounId: string | EthersBN, seed: Ithewordeed) => {
  const id = nounId.toString();
  const name = `Noun ${id}`;
  const description = `Noun ${id} is a member of the TheWord DAO`;
  const { parts, background } = getNounData(seed);
  const image = `data:image/svg+xml;base64,${btoa(buildSVG(parts, data.palette, background))}`;

  return {
    name,
    description,
    image,
  };
};

const StandaloneNoun: React.FC<StandaloneNounProps> = (props: StandaloneNounProps) => {
  const { nounId } = props;
  const seed = usethewordeed(nounId);
  const noun = seed && getNoun(nounId, seed);

  return (
    <Link to={'/noun/' + nounId.toString()} className={classes.clickableNoun}>
      <Noun imgPath={noun ? noun.image : ''} alt={noun ? noun.description : 'Noun'} />
    </Link>
  );
};

export const StandaloneNounWithSeed: React.FC<StandaloneNounWithSeedProps> = (
  props: StandaloneNounWithSeedProps,
) => {
  const { nounId, onLoadSeed, shouldLinkToProfile } = props;

  const seed = usethewordeed(nounId);

  if (!seed || !nounId || !onLoadSeed) return <Noun imgPath="" alt="Noun" />;

  onLoadSeed(seed);

  const { image, description } = getNoun(nounId, seed);

  const noun = <Noun imgPath={image} alt={description} />;
  const nounWithLink = (
    <Link to={'/noun/' + nounId.toString()} className={classes.clickableNoun}>
      {noun}
    </Link>
  );
  return shouldLinkToProfile ? nounWithLink : noun;
};

export default StandaloneNoun;
