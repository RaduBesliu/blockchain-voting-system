#Voting system 

## Team: Besliu Radu-Stefan, Nechita Maria-Ilinca
## Class: 343

The Blockchain Voting System is a decentralized application (dApp) designed to facilitate secure and transparent voting processes using blockchain technology. 
This system ensures that votes are immutable and verifiable, providing a trustworthy voting mechanism.


## Smart Contracts

➡️ CandidateManager.sol:
* Owners can add and remove candidates.
* Only valid candidates can be voted for.

➡️ PrizeManager.sol:
* The contract calculates the candidate with the highest votes.
* The voting process is considered complete when the winner is determined.

➡️ Voting.sol:
* Manages the voting process.
* Records votes and checks if a voter has already voted.
* Interfaces with the CandidateManagement and PrizeManager contracts.
* Interacts with the custom oracle to get the latest ETH/USD price.

➡️ VotingToken.sol:
* Voting tokens are implemented using the ERC-20 standard.
Tokens are minted and burned by the contract owner to manage voter eligibility.

## Deployment:
📝Contracts are deployed using Truffle and tested locally with Ganache.
📝A migration script deploys all contracts in the correct order and sets up initial states.


**Tests** are written in JavaScript to verify the functionality of each contract, including candidate management, voting mechanics, winner determination, and oracle integration.

## Oracle Integration:

* The system uses a custom oracle to fetch and update the latest ETH/USD price.
* This price can be manually set by the contract owner for testing purposes.

## ERC-20 Token:

* Voting tokens are implemented using the ERC-20 standard.
* Tokens are minted and burned by the contract owner to manage voter eligibility.
