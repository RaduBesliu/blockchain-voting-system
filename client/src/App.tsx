import './App.css';
import { LocalComponents } from './styled.ts';
import Accounts from './components/Accounts';
import Voting from '../../blockchain/build/contracts/Voting.json';
import CandidateManagement from '../../blockchain/build/contracts/CandidateManagement.json';
import VotingToken from '../../blockchain/build/contracts/VotingToken.json';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Account } from './types.ts';
import { Select, MenuItem, InputLabel, FormControl, Input } from '@mui/material';

const App = () => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [voteContract, setVoteContract] = useState<ethers.Contract | null>(null);
  const [candidateManagementContract, setCandidateManagementContract] = useState<ethers.Contract | null>(null);
  const [votingTokenContract, setVotingTokenContract] = useState<ethers.Contract | null>(null);

  const [performingTransaction, setPerformingTransaction] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const [signers, setSigners] = useState<ethers.Signer[]>([]);
  const [allVoteContracts, setAllVoteContracts] = useState<ethers.Contract[]>([]);

  const [selectedContract, setSelectedContract] = useState<ethers.Contract | undefined>(undefined);

  const [majorityThreshold, setMajorityThreshold] = useState<number>(0);

  const [finalTransactionGasEstimate, setFinalTransactionGasEstimate] = useState<number>(0);
  const [gasLimitForLastTransaction, setGasLimitForLastTransaction] = useState<number>(0);

  const [prizeAmount, setPrizeAmount] = useState<number>(0);

  const [forceRefresh, setForceRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (!voteContract) {
      return;
    }

    const voteCastListener = voteContract.filters.VoteCast();
    voteContract
      .on(voteCastListener, () => {
        console.log('Vote cast event refresh');
        setForceRefresh((prev) => !prev);
      })
      .then(() => {
        console.log('Vote cast listener added');
      });

    return () => {
      voteContract.removeAllListeners(voteCastListener).then();
    };
  }, [voteContract, candidateManagementContract]);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider('http://localhost:7545');
    setProvider(provider);

    provider.getSigner().then((signer) => {
      const contract = new ethers.Contract(Voting.networks['5777'].address, Voting.abi, signer);
      setVoteContract(contract);

      const prizeAmountPromise = contract.getPrizeAmount();
      prizeAmountPromise.then((_prizeAmount) => {
        setPrizeAmount(Number(ethers.formatEther(_prizeAmount)));
      });

      const candidateManagementContract = new ethers.Contract(
        CandidateManagement.networks['5777'].address,
        CandidateManagement.abi,
        signer,
      );

      const votingTokenContract = new ethers.Contract(VotingToken.networks['5777'].address, VotingToken.abi, signer);

      setCandidateManagementContract(candidateManagementContract);
      setVotingTokenContract(votingTokenContract);
    });
  }, []);

  useEffect(() => {
    if (!provider || !votingTokenContract) {
      return;
    }

    provider.listAccounts().then((fetchedAccounts) => {
      const balancePromises = fetchedAccounts.map((account) => provider.getBalance(account));
      Promise.all(balancePromises).then((balances) => {
        setAccounts(
          fetchedAccounts.map((account, index) => ({
            address: account.address,
            balance: parseFloat(ethers.formatEther(balances[index])),
          })),
        );
      });
      // mint 1 token to each account
      const mintPromises = fetchedAccounts.map((account) => votingTokenContract.mint(account, 1));
      Promise.all(mintPromises).then(() => {
        console.log('Tokens minted');
      });
    });
  }, [provider, forceRefresh, votingTokenContract]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    provider.listAccounts().then((fetchedAccounts) => {
      const signerPromises = fetchedAccounts.map((_, accountIndex) => provider.getSigner(accountIndex));
      Promise.all(signerPromises).then((signers) => {
        setSigners(signers);
      });
    });
  }, [provider]);

  useEffect(() => {
    if (!signers.length) {
      return;
    }

    const voteContracts = signers.map(
      (signer) => new ethers.Contract(Voting.networks['5777'].address, Voting.abi, signer),
    );
    setAllVoteContracts(voteContracts);
  }, [signers]);

  useEffect(() => {
    console.log('selectedContract: ', selectedContract);
  }, [selectedContract]);

  useEffect(() => {
    if (!voteContract || !provider || !accounts.length) {
      return;
    }

    const majorityThresholdPromise = voteContract.calculateMajority(accounts.length);
    majorityThresholdPromise.then((majorityThreshold) => {
      setMajorityThreshold(Number(majorityThreshold));
      console.log('majorityThreshold: ', Number(majorityThreshold));
    });
  }, [voteContract, provider, accounts, candidateManagementContract]);

  useEffect(() => {
    if (!provider || !accounts?.[0]?.address || !prizeAmount) {
      return;
    }

    console.log(prizeAmount);

    provider
      .estimateGas({ to: accounts[0].address, value: ethers.parseUnits(prizeAmount.toString(), 'ether') })
      .then((gasEstimate) => {
        setFinalTransactionGasEstimate(Number(gasEstimate));
      })
      .catch((error) => {
        console.error('Error estimating gas:', error.message);
      });
  }, [provider, accounts, voteContract, candidateManagementContract, prizeAmount]);

  return (
    <LocalComponents.Container>
      <Accounts
        provider={provider}
        accounts={accounts}
        voteContract={voteContract}
        candidateManagementContract={candidateManagementContract}
        performingTransaction={performingTransaction}
        setPerformingTransaction={setPerformingTransaction}
        selectedAccount={selectedAccount}
        selectedContract={selectedContract}
        majorityThreshold={majorityThreshold}
        gasLimitForLastTransaction={gasLimitForLastTransaction}
        prizeAmount={prizeAmount}
      />
      <LocalComponents.RightWrapper>
        <FormControl fullWidth>
          <InputLabel id='account'>Account</InputLabel>
          <Select
            labelId='account'
            value={selectedAccount}
            label='Account'
            disabled={performingTransaction}
            onChange={(event) => {
              setSelectedAccount(event.target.value);

              const signerIndex = accounts.findIndex((account) => account.address === event.target.value);
              setSelectedContract(allVoteContracts[signerIndex]);
            }}>
            {accounts.map((account, accountIndex) => (
              <MenuItem key={account.address} value={account.address}>
                Account {accountIndex} - {account.address} - {account.balance} ETH
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalComponents.InputsWrapper>
          <LocalComponents.GasEstimate>
            Final transaction gas estimate: {finalTransactionGasEstimate}
          </LocalComponents.GasEstimate>
          <Input
            placeholder='Gas limit'
            onChange={(event) => setGasLimitForLastTransaction(Number(event.target.value))}
          />
          <LocalComponents.GasEstimate>Prize amount</LocalComponents.GasEstimate>
          <Input
            placeholder='Prize amount'
            value={prizeAmount}
            onChange={(event) => setPrizeAmount(Number(event.target.value))}
          />
        </LocalComponents.InputsWrapper>
      </LocalComponents.RightWrapper>
    </LocalComponents.Container>
  );
};

export default App;
