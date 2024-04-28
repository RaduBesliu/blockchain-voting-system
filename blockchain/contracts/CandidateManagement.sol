// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CandidateManagement {
    address[] public candidates;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    constructor() {
        owner = msg.sender;
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
