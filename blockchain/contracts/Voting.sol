// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Import the CandidateManagement contract
import "./CandidateManagement.sol";
import "./PrizeManager.sol";

contract Voting {
    // State variables
    mapping(address => uint) public votesReceived;
    mapping(address => bool) public hasVoted;
    CandidateManagement public candidateManager;
    PrizeManager public prizeManager;

    address[] public hasVotedKeys;
    bool public hasVoteFinished = false;

    // Events
    event VoteCast(address voter, address candidate, uint totalVotes);
    event WinnerDetails(address indexed mostVoted, uint mostVotes);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == candidateManager.owner(), "Only the owner can call this function.");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already cast your vote.");
        _;
    }

    constructor(address candidateManagerAddress, address prizeManagerAddress) {
        candidateManager = CandidateManagement(candidateManagerAddress);
        prizeManager = PrizeManager(prizeManagerAddress);
    }

    function vote(address candidate) external hasNotVoted {
        require(candidateManager.isValidCandidate(candidate), "Not a valid candidate.");
        votesReceived[candidate] += 1;
        hasVoted[msg.sender] = true;

        hasVotedKeys.push(msg.sender);
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

    function getWinner() public onlyOwner returns (address, uint) {
        address[] memory candidates = candidateManager.getCandidates();
        PrizeManager.CandidateVotes[] memory votesReceivedStruct = new PrizeManager.CandidateVotes[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            votesReceivedStruct[i] = PrizeManager.CandidateVotes(candidates[i], votesReceived[candidates[i]]);
        }

        (address mostVoted, uint mostVotes) = prizeManager.getWinner(candidates, votesReceivedStruct);

        hasVoteFinished = true;

        emit WinnerDetails(mostVoted, mostVotes);
        return (mostVoted, mostVotes);
    }

    function getPrizeAmount() public onlyOwner view returns (uint) {
        return prizeManager.getPrizeAmount();
    }

    function getHasVoteFinished() public view returns (bool) {
        return hasVoteFinished;
    }
}