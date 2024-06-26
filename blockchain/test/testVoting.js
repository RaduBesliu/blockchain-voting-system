const Voting = artifacts.require("Voting");
const CandidateManagement = artifacts.require("CandidateManagement");
const PrizeManager = artifacts.require("PrizeManager");
const VotingToken = artifacts.require("VotingToken");

contract("Voting System", (accounts) => {
  let voting;
  let candidateManagement;
  let prizeManager;
  let votingToken;

  const owner = accounts[0];
  const nonOwner = accounts[1];
  const candidate1 = accounts[2];
  const candidate2 = accounts[3];
  const voter1 = accounts[4];
  const voter2 = accounts[5];

  beforeEach(async () => {
    prizeManager = await PrizeManager.new(100000, { from: owner });
    candidateManagement = await CandidateManagement.new({ from: owner });
    votingToken = await VotingToken.new({ from: owner });
    voting = await Voting.new(
      candidateManagement.address,
      prizeManager.address,
      votingToken.address,
      { from: owner },
    );

    await candidateManagement.addCandidate(candidate1, { from: owner });
    await candidateManagement.addCandidate(candidate2, { from: owner });
  });

  describe("Candidate Management", () => {
    it("should allow the owner to add a candidate", async () => {
      const isValid = await candidateManagement.isValidCandidate(candidate1);
      assert.isTrue(
        isValid,
        "Candidate should be valid after being added by the owner.",
      );
    });

    it("should prevent non-owners from adding candidates", async () => {
      try {
        await candidateManagement.addCandidate(accounts[6], { from: nonOwner });
        assert.fail("Non-owner should not be able to add candidates.");
      } catch (error) {
        assert.include(
          error.message,
          "revert",
          "Only the owner can call this function.",
        );
      }
    });

    it("should allow owner to remove a candidate", async () => {
      await candidateManagement.removeCandidate(candidate1, { from: owner });
      const isValid = await candidateManagement.isValidCandidate(candidate1);
      assert.isFalse(
        isValid,
        "Candidate should be invalid after being removed.",
      );
    });
  });

  describe("Voting Mechanics", () => {
    it("should allow a valid vote", async () => {
      await votingToken.mint(voter1, web3.utils.toWei("100", "ether"), {
        from: owner,
      });
      await votingToken.approve(
        voting.address,
        web3.utils.toWei("100", "ether"),
        { from: voter1 },
      );
      await voting.vote(candidate1, owner, {
        from: voter1,
        value: web3.utils.toWei("100", "ether"),
      });
      const votes = await voting.getTotalVotes(candidate1);
      assert.equal(votes.toNumber(), 1, "Candidate should have 1 vote.");
    });

    it("should prevent voting for an invalid candidate", async () => {
      try {
        await votingToken.mint(voter1, web3.utils.toWei("100", "ether"), {
          from: owner,
        });
        await votingToken.approve(
          voting.address,
          web3.utils.toWei("100", "ether"),
          { from: voter1 },
        );
        await voting.vote(accounts[6], owner, {
          from: voter1,
          value: web3.utils.toWei("100", "ether"),
        });
        assert.fail("Should not be able to vote for an invalid candidate.");
      } catch (error) {
        assert.include(error.message, "revert", "Not a valid candidate.");
      }
    });

    it("should prevent double voting", async () => {
      await votingToken.mint(voter1, web3.utils.toWei("100", "ether"), {
        from: owner,
      });
      await votingToken.approve(
        voting.address,
        web3.utils.toWei("100", "ether"),
        { from: voter1 },
      );
      await voting.vote(candidate1, owner, {
        from: voter1,
        value: web3.utils.toWei("100", "ether"),
      });
      try {
        await voting.vote(candidate1, owner, {
          from: voter1,
          value: web3.utils.toWei("100", "ether"),
        });
        assert.fail("Should not allow double voting from the same address.");
      } catch (error) {
        assert.include(
          error.message,
          "revert",
          "You have already cast your vote.",
        );
      }
    });
  });

  describe("Determine winner", () => {
    it("should correctly determine the winner", async () => {
      await votingToken.mint(voter1, web3.utils.toWei("100", "ether"), {
        from: owner,
      });
      await votingToken.mint(voter2, web3.utils.toWei("100", "ether"), {
        from: owner,
      });
      await votingToken.approve(
        voting.address,
        web3.utils.toWei("100", "ether"),
        { from: voter1 },
      );
      await votingToken.approve(
        voting.address,
        web3.utils.toWei("100", "ether"),
        { from: voter2 },
      );
      await voting.vote(candidate1, owner, {
        from: voter1,
        value: web3.utils.toWei("100", "ether"),
      });
      await voting.vote(candidate1, owner, {
        from: voter2,
        value: web3.utils.toWei("100", "ether"),
      });
      await voting.vote(candidate2, owner, {
        from: accounts[6],
        value: web3.utils.toWei("100", "ether"),
      });

      voting.getWinner().then((winnerObject) => {
        const winner = winnerObject.mostVoted;
        const totalVotes = winnerObject.mostVotes;

        assert.equal(winner, candidate1, "Candidate 1 should be the winner.");
        assert.equal(
          totalVotes.toNumber(),
          2,
          "There should be 2 total votes.",
        );
      });
    });
  });
});
