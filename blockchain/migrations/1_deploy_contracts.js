const Voting = artifacts.require("Voting");
const CandidateManagement = artifacts.require("CandidateManagement");
const PrizeManager = artifacts.require("PrizeManager");
const VotingToken = artifacts.require("VotingToken");

module.exports = async function (deployer) {
  await deployer.deploy(CandidateManagement);
  const candidateManagement = await CandidateManagement.deployed();

  await deployer.deploy(PrizeManager, web3.utils.toWei("100000", "ether"));
  const prizeManager = await PrizeManager.deployed();

  await deployer.deploy(VotingToken);
  const votingToken = await VotingToken.deployed();

  await deployer.deploy(
    Voting,
    candidateManagement.address,
    prizeManager.address,
    votingToken.address,
  );
};
