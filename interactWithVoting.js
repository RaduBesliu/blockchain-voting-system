const Voting = artifacts.require("Voting");

module.exports = async function(callback) {
  try {
    console.log("Interacting with Voting contract...");
    const accounts = await web3.eth.getAccounts();

    console.log("Deploying Voting contract...");
    const voting = await Voting.deployed();

    console.log("Resetting voting instance...");
    await voting.resetVotingInstance({ from: accounts[0] });

    console.log("Adding candidates...");
    await voting.addCandidate(accounts[6], { from: accounts[0] });
    await voting.addCandidate(accounts[7], { from: accounts[0] });

    // Voting for candidates
    console.log("Voting for candidates...");
    await voting.vote(accounts[7], { from: accounts[6] });
    await voting.vote(accounts[6], { from: accounts[2] });
    await voting.vote(accounts[6], { from: accounts[3] });

    // Checking votes
    console.log("Checking votes...");
    const votesForCandidate6 = await voting.getTotalVotes(accounts[6]);
    const votesForCandidate7 = await voting.getTotalVotes(accounts[7]);
    console.log(`Votes for candidate 6: ${votesForCandidate6}`);
    console.log(`Votes for candidate 7: ${votesForCandidate7}`);

    // Assuming getWinner function exists and is structured to return both winner and votes
    console.log("Getting winner...");
    const winnerObject = await voting.getWinner(); // Adjust according to your actual contract method's return type
    const winner = winnerObject.winner;
    const totalVotes = winnerObject.totalVotes;
    console.log(`Winner: ${winner} with ${totalVotes} votes`);

    // Sending Ether to the contract
    console.log("Sending Ether to the contract...");
    await web3.eth.sendTransaction({from: accounts[0], to: voting.address, value: web3.utils.toWei("100000", "ether")});

    // Sending reward (ensure your contract can handle this amount and is secure against common attacks)
    console.log("Sending reward...");
    await voting.transferEther(winner, web3.utils.toWei("1000", "ether"), { from: accounts[0] });
    console.log("Reward sent!");

    // Checking balance of the winner
    console.log("Checking balance...");
    const balance = await web3.eth.getBalance(winner);
    console.log(`Balance of winner: ${web3.utils.fromWei(balance, "ether")} ETH`);

    callback(); // Successful completion
  } catch (error) {
    console.error('Error encountered:', error);
    callback(error); // Pass error if there's an issue
  }
};