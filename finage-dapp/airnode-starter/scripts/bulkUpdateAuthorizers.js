require('dotenv').config();
const ethers = require('ethers');
const airnodeAdmin = require('@api3/airnode-admin');
const evm = require('../src/evm');
const parameters = require('../src/parameters');
async function main() {
  const config = require('../config/config.json');
  const airnode = await evm.getAirnode();
  const endpoints = config.triggers.request;

  async function updateAuth(endpoint) {
    console.log(`Updating ${endpoint.endpointId}`);
    await airnodeAdmin.updateAuthorizers(airnode, parameters.providerId, endpoint.endpointId, [
      ethers.constants.AddressZero,
    ]);
    console.log(`Updated authorizers of endpoint with ID ${endpoint.endpointId} to allow all public requests`);
    return;
  }
  for (endpoint of endpoints) await updateAuth(endpoint);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });