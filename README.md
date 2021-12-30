# theword-monorepo

TheWord DAO is collective bringing NFT innovations using the Christian Bible text.

TheWord incorporates several major NFT innovations and brings them to the marketplace
    1)  DeCre (Decentralized Creativeism)
    2)  "Then Current" metadata attribution/association
    3)  Guaranteed unique art metadata even for 1 thru N qty/volume of an NFT Instance

TheWord builds on the NFT innovations of:
    1)  TheWords
    2)  Loot

## Contributing

If you're interested in contributing to TheWord DAO repos we're excited to have you. Please discuss any changes in `#developers` in [discord.gg/theword](https://discord.gg/theword) prior to contributing to reduce duplication of effort and in case there is any prior art that may be useful to you.

## Packages

### theword-api

The [theword api](packages/theword-api) is an HTTP webserver that hosts token metadata. This is currently unused because on-chain, data URIs are enabled.

### theword-assets

The [theword assets](packages/theword-assets) package holds any/all TheWord PNG and run-length encoded image data.

### theword-bots

The [theword bots](packages/theword-bots) package contains a bot that monitors for changes in TheWord offering state and notifies everyone via Twitter and Discord.

### theword-contracts

The [theword contracts](packages/theword-contracts) is the suite of Solidity contracts powering TheWord DAO.

### theword-sdk

The [theword sdk](packages/theword-sdk) exposes the theword contract addresses, ABIs, and instances as well as image encoding and SVG building utilities.

### theword-subgraph

In order to make retrieving more complex data from the offering history, [theword subgraph](packages/theword-subgraph) contains subgraph manifests that are deployed onto [The Graph](https://thegraph.com).

### theword-webapp

The [theword webapp](packages/theword-webapp) is the frontend for interacting with TheWord offerings as hosted at [theword.wtf](https://theword.wtf).

## Quickstart

### Install dependencies

```sh
yarn
```

### Build all packages

```sh
yarn build
```

### Run Linter

```sh
yarn lint
```

### Run Prettier

```sh
yarn format
```
