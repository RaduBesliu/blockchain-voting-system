const Voting = artifacts.require("Voting");
const CandidateManagement = artifacts.require("CandidateManagement");
const PrizeManager = artifacts.require("PrizeManager");
const VotingToken = artifacts.require("VotingToken");

module.exports = async function (deployer) {
  // Deploy the CandidateManagement contract first
  await deployer.deploy(CandidateManagement);
  const candidateManagement = await CandidateManagement.deployed();

  // Deploy the PrizeManager contract next
  await deployer.deploy(PrizeManager, web3.utils.toWei("100000", "ether"));
  const prizeManager = await PrizeManager.deployed();

  // Deploy the VotingToken contract next
  await deployer.deploy(VotingToken);
  const votingToken = await VotingToken.deployed();

  // Then deploy the Voting contract with the addresses of the deployed contracts
  await deployer.deploy(
    Voting,
    candidateManagement.address,
    prizeManager.address,
    votingToken.address,
  );
};
