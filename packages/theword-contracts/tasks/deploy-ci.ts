import fs from 'fs';
import { task } from 'hardhat/config';

task('deploy-ci', 'Deploy contracts (automated by CI)')
  .addOptionalParam('theworddersdao', 'The thewordders DAO contract address')
  .addOptionalParam(
    'weth',
    'The WETH contract address',
    '0xc778417e063141139fce010982780140aa0cd5ab',
  )
  .setAction(async ({ theworddersdao, weth }, { ethers, run }) => {
    const [deployer] = await ethers.getSigners();
    const contracts = await run('deploy', {
      weth,
      theworddersDAO: theworddersdao || deployer.address,
    });

    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    fs.writeFileSync(
      'logs/deploy.json',
      JSON.stringify({
        contractAddresses: {
          NFTDescriptor: contracts.NFTDescriptor.address,
          thewordDescriptor: contracts.thewordDescriptor.address,
          thewordSeeder: contracts.thewordSeeder.address,
          thewordToken: contracts.thewordToken.address,
        },
        gitHub: {
          // Get the commit sha when running in CI
          sha: process.env.GITHUB_SHA,
        },
      }),
      { flag: 'w' },
    );
  });
