// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Import the CandidateManagement contract
import "./CandidateManagement.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Voting {
    // State variables
    mapping(address => uint) public votesReceived;
    mapping(address => bool) public hasVoted;
    CandidateManagement public candidateManager;

    address[] public hasVotedKeys;

    // Events
    event VoteCast(address voter, address candidate, uint totalVotes);
    event Withdrawal(address initiator, uint amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == candidateManager.owner(), "Only the owner can call this function.");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already cast your vote.");
        _;
    }

    constructor(address candidateManagerAddress) {
        candidateManager = CandidateManagement(candidateManagerAddress);
    }

    function vote(address candidate) external hasNotVoted {
        require(candidateManager.isValidCandidate(candidate), "Not a valid candidate.");
        votesReceived[candidate] += 1;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, candidate, votesReceived[candidate]);
    }

    function getTotalVotes(address candidate) public view returns (uint) {
        require(candidateManager.isValidCandidate(candidate), "Not a valid candidate.");
        return votesReceived[candidate];
    }

    function calculateMajority(uint votersCount) public pure returns (uint) {
        return (votersCount / 2) + 1;
    }

    function getVotesObject() public view returns (address[] memory, uint[] memory) {
        address[] memory candidates = candidateManager.getCandidates();
        uint[] memory votes = new uint[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            votes[i] = votesReceived[candidates[i]];
        }

        return (candidates, votes);
    }

    function getHasVoted() public view returns (address[] memory) {
        return hasVotedKeys;
    }

    function getWinner() public view returns (address winner, uint totalVotes) {
        uint highestVotes = 0;
        address highestVoter;
        address[] memory candidates = candidateManager.getCandidates();
        for (uint i = 0; i < candidates.length; i++) {
            if (Math.max(highestVotes, votesReceived[candidates[i]]) == votesReceived[candidates[i]]) {
                highestVotes = votesReceived[candidates[i]];
                highestVoter = candidates[i];
            }
        }
        return (highestVoter, highestVotes);
    }
}