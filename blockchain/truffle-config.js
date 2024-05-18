const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const mnemonic = process.env.MNEMONIC;
const sepoliaEndpoint = process.env.INFURA_URL;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, sepoliaEndpoint),
      network_id: 11155111,
      gas: 4000000,
      confirmations: 2,
      timeoutBlocks: 200,
      networkCheckTimeout: 10000,
      skipDryRun: true,
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },

  mocha: {},

  compilers: {
    solc: {
      version: "0.8.13",
    },
  },
};
