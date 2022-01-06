import { ImageData as data, getTheWordData } from '@theword/assets';
import { buildSVG } from '@theword/sdk';
import { BigNumber as EthersBN } from 'ethers';
import { ITheWordSeed, useTheWordSeed } from '../../wrappers/thewordToken';
import TheWord from '../TheWord';
import { Link } from 'react-router-dom';
import classes from './StandaloneTheWord.module.css';

interface StandaloneTheWordProps {
  thewordId: EthersBN;
}

interface StandaloneTheWordWithSeedProps {
  thewordId: EthersBN;
  onLoadSeed?: (seed: ITheWordSeed) => void;
  shouldLinkToProfile: boolean;
}

const getTheWord = (thewordId: string | EthersBN, seed: ITheWordSeed) => {
  const id = thewordId.toString();
  const name = `TheWord ${id}`;
  const description = `TheWord ${id} is a member of the TheWord DAO`;
  const { parts, background } = getTheWordData(seed);
  const image = `data:image/svg+xml;base64,${btoa(buildSVG(parts, data.palette, background))}`;

  return {
    name,
    description,
    image,
  };
};

const StandaloneTheWord: React.FC<StandaloneTheWordProps> = (props: StandaloneTheWordProps) => {
  const { thewordId } = props;
  const seed = useTheWordSeed(thewordId);
  const theword = seed && getTheWord(thewordId, seed);

  return (
    <Link to={'/theword/' + thewordId.toString()} className={classes.clickableTheWord}>
      <TheWord
        imgPath={theword ? theword.image : ''}
        alt={theword ? theword.description : 'TheWord'}
      />
    </Link>
  );
};

export const StandaloneTheWordWithSeed: React.FC<StandaloneTheWordWithSeedProps> = (
  props: StandaloneTheWordWithSeedProps,
) => {
  const { thewordId, onLoadSeed, shouldLinkToProfile } = props;

  const seed = useTheWordSeed(thewordId);

  if (!seed || !thewordId || !onLoadSeed) return <TheWord imgPath="" alt="TheWord" />;

  onLoadSeed(seed);

  const { image, description } = getTheWord(thewordId, seed);

  const theword = <TheWord imgPath={image} alt={description} />;
  const thewordWithLink = (
    <Link to={'/theword/' + thewordId.toString()} className={classes.clickableTheWord}>
      {theword}
    </Link>
  );
  return shouldLinkToProfile ? thewordWithLink : theword;
};

export default StandaloneTheWord;
