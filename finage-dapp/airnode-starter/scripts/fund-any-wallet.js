require('dotenv').config();
const ethers = require('ethers');
const evm = require('../src/evm');
const util = require('../src/util');
const fs = require('fs');
const chalk = require('chalk');

async function main() {
//   const amount = '0.001'; // ETH
  const wallet = await evm.getWallet();
  const balance = (Number(await wallet.getBalance())/10**18).toFixed(4);
  const amount = balance.toString();
//   const designatedWalletAddress = await wallet.address;


  const walletNew = await ethers.Wallet.createRandom();
  fs.writeFileSync(
    '.env',
    `MNEMONIC=${walletNew.mnemonic.phrase}\nPROVIDER_URL=` + process.env.PROVIDER_URL + `\n`
  );
  console.log('Mnemonic phrase (',chalk.red.redBright('do not use on mainnet'),'):');
  console.log(chalk.blue.cyanBright(walletNew.mnemonic.phrase));
  console.log("New wallet address:");
  console.log(chalk.blue.cyanBright(walletNew.address));
  console.log("Sending ", amount, " network tokens from ", chalk.greenBright(wallet.address), "to ", chalk.blue.cyanBright(walletNew.address),"....")


  const receipt = await wallet.sendTransaction({
    to: walletNew.address,
    value: ethers.utils.parseEther(amount),
  });
  function sent() {
    return new Promise((resolve) => wallet.provider.once(receipt.hash, resolve));
  }
  await sent();
  console.log("Sent ", amount, " network tokens from ", chalk.greenBright(wallet.address), "to ", chalk.blue.cyanBright(walletNew.address),"....")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
