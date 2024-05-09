// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/math/Math.sol";

contract PrizeManager {
    struct CandidateVotes {
        address candidate;
        uint votes;
    }

    uint public prizeAmount;
    address public owner;

    event BeginGetWinner(address[] candidates, CandidateVotes[] votesReceivedStruct, address winner, uint totalVotes);

    constructor(uint _prizeAmount) {
        prizeAmount = _prizeAmount;
    }

    function setPrizeAmount(uint _newPrizeAmount) public {
        owner = msg.sender;
        prizeAmount = _newPrizeAmount;
    }

    function getPrizeAmount() public view returns (uint) {
        return prizeAmount;
    }

    function getWinner(address[] memory candidates, CandidateVotes[] memory votesReceivedStruct) public returns (address, uint) {
        uint mostVotes = 0;
        address mostVoted;
        for (uint i = 0; i < candidates.length; i++) {
            if (Math.max(votesReceivedStruct[i].votes, mostVotes) == votesReceivedStruct[i].votes) {
                mostVotes = votesReceivedStruct[i].votes;
                mostVoted = votesReceivedStruct[i].candidate;
            }
        }

        emit BeginGetWinner(candidates, votesReceivedStruct, mostVoted, mostVotes);
        return (mostVoted, mostVotes);
    }
}
