const Voting = artifacts.require("Voting");

contract("Voting", accounts => {
  let voting;
  const owner = accounts[0];
  const nonOwner = accounts[1];
  const candidate1 = accounts[2];
  const candidate2 = accounts[3];
  const voter1 = accounts[4];
  const voter2 = accounts[5];

  beforeEach(async () => {
    voting = await Voting.new({ from: owner });
    await voting.addCandidate(candidate1, { from: owner });
    await voting.addCandidate(candidate2, { from: owner });
  });

  describe("Candidate Management", () => {
    it("should allow the owner to add a candidate", async () => {
      const isValid = await voting.isValidCandidate(candidate1);
      assert.isTrue(isValid, "Candidate should be valid after being added.");
    });

    it("should prevent non-owners from adding candidates", async () => {
      try {
        await voting.addCandidate(accounts[6], { from: nonOwner });
        assert.fail("Non-owner should not be able to add candidates.");
      } catch (error) {
        assert.include(error.message, "revert", "Only the owner can add candidates");
      }
    });

    it("should allow owner to remove a candidate", async () => {
      await voting.removeCandidate(candidate1, { from: owner });
      const isValid = await voting.isValidCandidate(candidate1);
      assert.isFalse(isValid, "Candidate should be invalid after being removed.");
    });
  });

  describe("Voting Mechanics", () => {
    it("should allow a valid vote", async () => {
      await voting.vote(candidate1, { from: voter1 });
      const votes = await voting.getTotalVotes(candidate1);
      assert.equal(votes.toNumber(), 1, "Candidate should have 1 vote.");
    });

    it("should prevent voting for an invalid candidate", async () => {
      try {
        await voting.vote(accounts[6], { from: voter1 });
        assert.fail("Should not be able to vote for an invalid candidate.");
      } catch (error) {
        assert.include(error.message, "revert", "Not a valid candidate.");
      }
    });

    it("should prevent double voting", async () => {
      await voting.vote(candidate1, { from: voter1 });
      try {
        await voting.vote(candidate1, { from: voter1 });
        assert.fail("Should not allow double voting from the same address.");
      } catch (error) {
        assert.include(error.message, "revert", "You have already cast your vote.");
      }
    });
  });

  describe("Access Controls and Ether Management", () => {
    it("should handle Ether transfers correctly", async () => {
      // Sending Ether to the contract
      await web3.eth.sendTransaction({ from: owner, to: voting.address, value: web3.utils.toWei("1", "ether") });
      await voting.transferEther(nonOwner, web3.utils.toWei("1", "ether"), { from: owner });

      const balance = await web3.eth.getBalance(nonOwner);
      assert.isTrue(web3.utils.fromWei(balance, "ether") > 0, "Non-owner should have received Ether.");
    });

    it("should prevent non-owners from transferring Ether", async () => {
      try {
        await voting.transferEther(nonOwner, web3.utils.toWei("1", "ether"), { from: nonOwner });
        assert.fail("Non-owner should not be able to transfer Ether.");
      } catch (error) {
        assert.include(error.message, "revert", "Only the owner can call this function.");
      }
    });
  });

  describe("Determine winner", () => {
    it("should correctly determine the winner", async () => {
      await voting.vote(candidate1, { from: voter1 });
      await voting.vote(candidate1, { from: voter2 });
      await voting.vote(candidate2, { from: accounts[6] });

      const candidate1Votes = await voting.getTotalVotes(candidate1);
      const candidate2Votes = await voting.getTotalVotes(candidate2);

      const winnerObject = await voting.getWinner();
      const winner = winnerObject.winner;
      const totalVotes = winnerObject.totalVotes;

      assert.equal(winner, candidate1, "Candidate 1 should be the winner.");
      assert.equal(totalVotes.toNumber(), 2, "There should be 2 total votes.");
      assert.equal(candidate1Votes.toNumber(), 2, "Candidate 1 should have 2 votes.");
      assert.equal(candidate2Votes.toNumber(), 1, "Candidate 2 should have 1 vote.");
    });
  });
});
