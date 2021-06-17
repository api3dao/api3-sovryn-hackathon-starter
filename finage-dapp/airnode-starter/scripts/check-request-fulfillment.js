const Web3 = require('web3');
const chalk = require('chalk');
let airnodeABIObj = require('./ABI/airnodeABI.js');
let config = require('../config/config.json');
let airnodeABI = airnodeABIObj.airnodeABI;



async function main(){
  let chainId = process.argv[2];
  let chain;
  try{
    chain = getChain(chainId);
  }
  catch(e){
    throw(e);
  }
  let rpc = chain.providers[0].url
  let airnodeAddress = chain.contracts.Airnode

var i;
let web3 = new Web3(rpc);
var END_BLOCK =  await web3.eth.getBlockNumber();
var airnodeContract = new web3.eth.Contract(airnodeABI, airnodeAddress);
for (i = 0; i < 1; i++) {
   console.log(END_BLOCK);
   let events = await airnodeContract.getPastEvents("AllEvents", 
        {fromBlock: END_BLOCK -1000,
        toBlock: END_BLOCK}
    );        
    END_BLOCK = END_BLOCK - 1000;
    console.log(events);
}
}

function getChain(chainId){
  let chain;
  config.nodeSettings.chains.forEach((value, index) => {
      
      if(value.id === chainId){
        chain = config.nodeSettings.chains[index];
      }
      if(index === config.nodeSettings.chains.length - 1 && !chain){
        throw (
          chalk.red("Error ChainId: '",chainId, "' not found in config. Please run the command in this format 'npm run check-request-fulfillment -- chainId'")
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
