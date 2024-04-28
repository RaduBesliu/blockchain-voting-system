const Voting = artifacts.require("Voting");
const CandidateManagement = artifacts.require("CandidateManagement");

module.exports = async function (deployer) {
  // Deploy the CandidateManagement contract first
  await deployer.deploy(CandidateManagement);
  const candidateManagement = await CandidateManagement.deployed();

  // Then deploy the Voting contract with the address of the deployed CandidateManagement contract
  await deployer.deploy(Voting, candidateManagement.address);
};
