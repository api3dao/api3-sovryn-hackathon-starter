

require('dotenv').config();
const ethers = require('ethers');
const evm = require('../src/evm');
const airnodeAdmin = require('@api3/airnode-admin');
const util = require('../src/util');
const fs = require('fs');
const chalk = require('chalk');
const parameters = require('../src/parameters');
const airnodeProtocol = require('@api3/airnode-protocol');
let config = require('../config/config.json');




async function main() {

  let chainId = process.argv[2];
  let chain;
  try{
    chain = getChain(chainId);
  }
  catch(e){
    throw(e);
  }
  const wallet = await getWallet(chain);
  const balance = (Number(await wallet.getBalance())/10**18).toFixed(4);
  const amount = balance.toString();
  console.log('Master Wallet Balance: ', chalk.green.greenBright(amount));  

  const requesterIndex = util.readFromLogJson('Requester index');
  const airnode = await evm.getAirnode();
  const designatedWalletAddress = await airnodeAdmin.deriveDesignatedWallet(
    airnode,
    parameters.providerId,
    requesterIndex
  );

  let designatedBalance = await wallet.provider.getBalance(designatedWalletAddress);
  console.log('Designated Wallet Balance: ', chalk.green.greenBright((designatedBalance/10**18).toFixed(5)))  
}

function getWallet(chain){
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  const provider = new ethers.providers.JsonRpcProvider(chain.providers[0].url);
  return wallet.connect(provider);
}

function getChain(chainId){
  let chain;
  config.nodeSettings.chains.forEach((value, index) => {
      
      if(value.id === chainId){
        chain = config.nodeSettings.chains[index];
      }
      if(index === config.nodeSettings.chains.length - 1 && !chain){
        throw (
          chalk.red("Error ChainId: '",chainId, "' not found in config. Please run the command in this format 'npm run check-balance -- chainId'")
        );
      }

  })
  return chain;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
