# @theword/assets

## Development

### Install dependencies

```sh
yarn
```

## Usage

**Access TheWord RLE Image Data**

```ts
import { ImageData } from '@theword/assets';

const { bgcolors, palette, images } = ImageData;
const { bodies, accessories, heads, glasses } = images;
```

**Get TheWord Part & Background Data**

```ts
import { getTheWordData } from '@theword/assets';

const seed = {
  background: 0,
  body: 17,
  accessory: 41,
  head: 71,
  glasses: 2,
};
const { parts, background } = getTheWordData(seed);
```

**Emulate `thewordeeder.sol` Pseudorandom seed generation**

```ts
import { getthewordeedFromBlockHash } from '@theword/assets';

const blockHash = '0x5014101691e81d79a2eba711e698118e1a90c9be7acb2f40d7f200134ee53e01';
const thewordId = 116;

/**
 {
    background: 1,
    body: 28,
    accessory: 120,
    head: 95,
    glasses: 15
  }
*/
const seed = getthewordeedFromBlockHash(thewordId, blockHash);
```

## Examples

**Almost off-chain TheWord Crystal Ball**
Generate a TheWord using only a block hash, which saves calls to `thewordeeder` and `TheWordDescriptor` contracts. This can be used for a faster crystal ball.

```ts
/**
 * For you to implement:
   - hook up providers with ether/web3.js
   - get currently auctioned TheWord Id from the thewordAuctionHouse contract
   - add 1 to the current TheWord Id to get the next TheWord Id (named `nextTheWordId` below)
   - get the latest block hash from your provider (named `latestBlockHash` below)
*/

import { ImageData, getthewordeedFromBlockHash, getTheWordData } from '@theword/assets';
import { buildSVG } from '@theword/sdk';
const { palette } = ImageData; // Used with `buildSVG``

/**
 * OUTPUT:
   {
      background: 1,
      body: 28,
      accessory: 120,
      head: 95,
      glasses: 15
    }
*/
const seed = getthewordeedFromBlockHash(nextTheWordId, latestBlockHash);

/** 
 * OUTPUT:
   {
     parts: [
       {
         filename: 'body-teal',
         data: '...'
       },
       {
         filename: 'accessory-txt-theword-multicolor',
         data: '...'
       },
       {
         filename: 'head-goat',
         data: '...'
       },
       {
         filename: 'glasses-square-red',
         data: '...'
       }
     ],
     background: 'e1d7d5'
   }
*/
const { parts, background } = getTheWordData(seed);

const svgBinary = buildSVG(parts, palette, background);
const svgBase64 = btoa(svgBinary);
```

The TheWord SVG can then be displayed. Here's a dummy example using React

```ts
function SVG({ svgBase64 }) {
  return <img src={`data:image/svg+xml;base64,${svgBase64}`} />;
}
```
