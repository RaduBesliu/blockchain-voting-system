const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const mnemonic = process.env.MNEMONIC
const sepoliaEndpoint = process.env.INFURA_URL

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, sepoliaEndpoint),
      network_id: 11155111, // Sepolia's network ID
      gas: 4000000, // Adjust the gas limit as per your requirements
      confirmations: 2, // Set the number of confirmations needed for a transaction
      timeoutBlocks: 200, // Set the timeout for transactions
      networkCheckTimeout: 10000,
      skipDryRun: true // Skip the dry run option
    },
    development: {
      host: "127.0.0.1",
      port: 7545, // Ensure this matches Ganache's port
      network_id: "*" // Match any network id
    }
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.13"      // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
};