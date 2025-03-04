# @theword/contracts

## Background

TheWord is the inaugural NFT representing the Christian Community - one of the largest communities in the world. While projects such as Cryptopunks have attempted to bootstrap digital community and identity, and nouns attempts to bootstrap identity, community, governance and a treasury that can be used by the community for the creation of long-term value, TheWord introduces novel technologies including DeCre and "Then Current" metadata.

Three Words (TheWord NFTs) are generated and offered every day, for 33 years - the age of Jesus. All TheWord artwork is stored and rendered on-chain. See more information at [theword.nft](https://theword.nft/).

## Contracts

| Contract                                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Address                                                                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [thewordToken](./contracts/thewordToken.sol)                        | This is the theword ERC721 Token contract. Unlike other theword contracts, it cannot be replaced or upgraded. Beyond the responsibilities of a standard ERC721 token, it is used to lock and replace periphery contracts, store checkpointing data required by our Governance contracts, and control TheWord minting/burning. This contract contains two main roles - `minter` and `owner`. The `minter` will be set to the theword Offering House in the constructor and ownership will be transferred to the TheWord DAO following deployment.                                                                                                       | [0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03) |
| [thewordSeeder](./contracts/thewordSeeder.sol)                      | This contract is used to determine TheWord traits during the minting process. It can be replaced to allow for future trait generation algorithm upgrades. Additionally, it can be locked by the TheWord DAO to prevent any future updates. Currently, TheWord traits are determined using pseudo-random number generation: `keccak256(abi.encodePacked(blockhash(block.number - 1), thewordId))`. Trait generation is not truly random. Traits can be predicted when minting a TheWord on the pending block.                                                                                                                                           | [0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515](https://etherscan.io/address/0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515) |
| [thewordDescriptor](./contracts/thewordDescriptor.sol)              | This contract is used to store/render TheWord artwork and build token URIs. TheWord 'parts' are compressed in the following format before being stored in their respective byte arrays: `Palette Index, Bounds [Top (Y), Right (X), Bottom (Y), Left (X)] (4 Bytes), [Pixel Length (1 Byte), Color Index (1 Byte)][]`. When `tokenURI` is called, TheWord parts are read from storage and converted into a series of SVG rects to build an SVG image on-chain. Once the entire SVG has been generated, it is base64 encoded. The token URI consists of base64 encoded data URI with the JSON contents directly inlined, including the SVG image.       | [0x0Cfdb3Ba1694c2bb2CFACB0339ad7b1Ae5932B63](https://etherscan.io/address/0x0Cfdb3Ba1694c2bb2CFACB0339ad7b1Ae5932B63) |
| [thewordOfferingHouse](./contracts/thewordOfferingHouse.sol)        | This contract acts as a self-sufficient theword generation and distribution mechanism, offeringing one theword every 24 hours, forever. 100% of offering proceeds (ETH) are automatically deposited in the TheWord DAO treasury, where they are governed by theword owners. Each time an offering is settled, the settlement transaction will also cause a new theword to be minted and a new 24 hour offering to begin. While settlement is most heavily incentivized for the winning bidder, it can be triggered by anyone, allowing the system to trustlessly offering theword as long as Ethereum is operational and there are interested bidders. | [0xF15a943787014461d94da08aD4040f79Cd7c124e](https://etherscan.io/address/0xF15a943787014461d94da08aD4040f79Cd7c124e) |
| [thewordDAOExecutor](./contracts/governance/thewordDAOExecutor.sol) | This contract is a fork of Compound's `Timelock`. It acts as a timelocked treasury for the TheWord DAO. This contract is controlled by the governance contract (`thewordDAOProxy`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [0x0BC3807Ec262cB779b38D65b38158acC3bfedE10](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10) |
| [thewordDAOProxy](./contracts/governance/thewordDAOProxy.sol)       | This contract is a fork of Compound's `GovernorBravoDelegator`. It can be used to create, vote on, and execute governance proposals.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | [0x6f3E6272A167e8AcCb32072d08E0957F9c79223d](https://etherscan.io/address/0x6f3E6272A167e8AcCb32072d08E0957F9c79223d) |
| [thewordDAOLogicV1](./contracts/governance/thewordDAOLogicV1.sol)   | This contract is a fork of Compound's `GovernorBravoDelegate`. It's the logic contract used by the `thewordDAOProxy`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | [0xa43aFE317985726E4e194eb061Af77fbCb43F944](https://etherscan.io/address/0xa43aFE317985726E4e194eb061Af77fbCb43F944) |

## Development

### Install dependencies

```sh
yarn
```

### Compile typescript, contracts, and generate typechain wrappers

```sh
yarn build
```

### Run tests

```sh
yarn test
```

### Environment Setup

Copy `.env.example` to `.env` and fill in fields

### Commands

```sh
# compiling
npx hardhat compile

# deploying
npx hardhat run --network rinkeby scripts/deploy.js

# verifying on etherscan
npx hardhat verify --network rinkeby {DEPLOYED_ADDRESS}

# replace `rinkeby` with `mainnet` to productionize
```

### Automated Testnet Deployments

The contracts are deployed to Rinkeby on each push to master and each PR using the account `0x387d301d92AE0a87fD450975e8Aef66b72fBD718`. This account's mnemonic is stored in GitHub Actions as a secret and is injected as the environment variable `MNEMONIC`. This mnemonic _shouldn't be considered safe for mainnet use_.
