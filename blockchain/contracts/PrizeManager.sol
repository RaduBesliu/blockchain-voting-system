// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13 <0.9.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PrizeManager is Ownable {
    struct CandidateVotes {
        address candidate;
        uint votes;
    }

    uint public prizeAmount;

    event BeginGetWinner(address[] candidates, CandidateVotes[] votesReceivedStruct, address winner, uint totalVotes);

    constructor(uint _prizeAmount) {
        prizeAmount = _prizeAmount;
        transferOwnership(msg.sender);
    }

    function setPrizeAmount(uint _newPrizeAmount) public onlyOwner {
        prizeAmount = _newPrizeAmount;
    }

    function getPrizeAmount() public view returns (uint) {
        return prizeAmount;
    }

    function getWinner(address[] memory candidates, CandidateVotes[] memory votesReceivedStruct) public onlyOwner returns (address, uint) {
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
