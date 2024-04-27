// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
    // State variables
    mapping(address => uint) public votesReceived;
    mapping(address => bool) public hasVoted;

    address public owner;
    address[] public candidates;
    address[] public hasVotedKeys;

    // Events
    event VoteCast(address voter, address candidate, uint totalVotes);
    event Withdrawal(address initiator, uint amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already cast your vote.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function addCandidate(address candidate) public onlyOwner {
        require(candidate != address(0), "Invalid address.");
        candidates.push(candidate);
    }

    function removeCandidate(address candidate) public onlyOwner {
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i] == candidate) {
                candidates[i] = candidates[candidates.length - 1];
                candidates.pop();
                return;
            }
        }
    }

    function vote(address candidate) external hasNotVoted {
        require(isValidCandidate(candidate), "Not a valid candidate.");
        votesReceived[candidate] += 1;
        hasVoted[msg.sender] = true;
        hasVotedKeys.push(msg.sender);
        emit VoteCast(msg.sender, candidate, votesReceived[candidate]);
    }

    function getVotesObject() public view returns (address[] memory, uint[] memory) {
        uint[] memory votes = new uint[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            votes[i] = votesReceived[candidates[i]];
        }

        return (candidates, votes);
    }

    function getHasVoted() public view returns (address[] memory) {
        return hasVotedKeys;
    }

    function resetVotingInstance() public onlyOwner {
        for (uint i = 0; i < candidates.length; i++) {
            votesReceived[candidates[i]] = 0;
        }

        delete candidates;
        delete hasVotedKeys;
    }

    function isValidCandidate(address candidate) public view returns (bool) {
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i] == candidate) {
                return true;
            }
        }
        return false;
    }

    function getTotalVotes(address candidate) public view returns (uint) {
        require(isValidCandidate(candidate), "Not a valid candidate.");
        return votesReceived[candidate];
    }

    function getWinner() public view returns (address winner, uint totalVotes) {
        uint highestVotes = 0;
        address highestVoter;
        for (uint i = 0; i < candidates.length; i++) {
            if (votesReceived[candidates[i]] > highestVotes) {
                highestVotes = votesReceived[candidates[i]];
                highestVoter = candidates[i];
            }
        }
        return (highestVoter, highestVotes);
    }

    function transferEther(address payable recipient, uint amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance.");
        recipient.transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    receive() external payable {}

    function interactWithAnotherContract(address otherContract, bytes memory data) public onlyOwner {
        (bool success, ) = otherContract.call(data);
        require(success, "Interaction with the other contract failed.");
    }

    function deployAndInteractWithNewContract() public onlyOwner {
        NewContract newContract = new NewContract();
        newContract.performAction();
    }
}

contract NewContract {
    uint public actionCount;

    function performAction() external {
        actionCount += 1;
    }
}
