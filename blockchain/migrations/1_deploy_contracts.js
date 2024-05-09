const Voting = artifacts.require("Voting");
const CandidateManagement = artifacts.require("CandidateManagement");
const PrizeManager = artifacts.require("PrizeManager");

module.exports = async function (deployer) {
  // Deploy the CandidateManagement contract first
  await deployer.deploy(CandidateManagement);
  const candidateManagement = await CandidateManagement.deployed();

  // Deploy the PrizeManager contract
  await deployer.deploy(PrizeManager, web3.utils.toWei("100000", "ether")); // Set initial prize amount
  const prizeManager = await PrizeManager.deployed();

  // Then deploy the Voting contract with the addresses of the deployed CandidateManagement and PrizeManager contracts
  await deployer.deploy(
    Voting,
    candidateManagement.address,
    prizeManager.address,
  );
};
