pragma solidity >=0.8.13 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CandidateManagement is Ownable {
    address[] public candidates;

    constructor() {
        transferOwnership(msg.sender);
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

    function isValidCandidate(address candidate) public view returns (bool) {
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i] == candidate) {
                return true;
            }
        }
        return false;
    }

    function getCandidates() public view returns (address[] memory) {
        return candidates;
    }
}
