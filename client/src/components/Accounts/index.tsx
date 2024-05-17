import { LocalComponents } from './styled.ts';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Account } from '../../types.ts';
import { Button } from '@mui/material';
import { ethers } from 'ethers';
import Snackbar from '@mui/material/Snackbar';

const Accounts = ({
  provider,
  accounts,
  voteContract,
  candidateManagementContract,
  performingTransaction,
  setPerformingTransaction,
  selectedAccount,
  selectedContract,
  majorityThreshold,
  gasLimitForLastTransaction,
  prizeAmount,
}: {
  provider: ethers.JsonRpcProvider | null;
  accounts: Account[];
  voteContract: ethers.Contract | null;
  candidateManagementContract: ethers.Contract | null;
  performingTransaction: boolean;
  setPerformingTransaction: Dispatch<SetStateAction<boolean>>;
  selectedAccount: string;
  selectedContract: ethers.Contract | undefined;
  majorityThreshold: number;
  gasLimitForLastTransaction: number;
  prizeAmount: number;
}) => {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [hasVotedObject, setHasVotedObject] = useState<Record<string, boolean>>({});

  const [hasVoteFinished, setHasVoteFinished] = useState<boolean | null>(null);

  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
  const snackbarMessageRef = useRef<string>('');

  useEffect(() => {
    voteContract?.getHasVoteFinished().then((fetchedHasVoteFinished) => {
      setHasVoteFinished(fetchedHasVoteFinished);
      console.log('fetchedHasVoteFinished: ', fetchedHasVoteFinished);
    });
  }, [voteContract]);

  useEffect(() => {
    if (!voteContract || !candidateManagementContract) {
      return;
    }

    const voteCastListener = voteContract.filters.VoteCast();
    voteContract
      .on(voteCastListener, () => {
        snackbarMessageRef.current = 'Vote casted successfully';
        setIsSnackbarOpen(true);
      })
      .then(() => {
        console.log('Vote cast listener added');
      });

    const winnerDetailsListener = voteContract.filters.WinnerDetails();
    voteContract
      .on(winnerDetailsListener, (winnerObject) => {
        const mostVoted = winnerObject.args[0];
        const mostVotes = winnerObject.args[1];

        console.log('Winner: ', mostVoted, ' with ', Number(mostVotes), ' votes');
        console.log('Prize amount: ', prizeAmount);

        provider?.getSigner().then((signer) => {
          signer
            ?.sendTransaction({
              to: mostVoted,
              value: ethers.parseUnits(prizeAmount.toString(), 'ether'),
              gasLimit: gasLimitForLastTransaction ? gasLimitForLastTransaction : null,
            })
            .then((transactionResponse) => {
              console.log(`[transferEther] Transaction hash: ${transactionResponse.hash}`);
              console.log(`[transferEther] Waiting for transaction to be mined...`);
              transactionResponse.wait().then((receipt: any) => {
                console.log(`[transferEther] Transaction was mined in block: ${receipt.blockNumber}`);
              });
              console.log(`[transferEther] Transaction was successful`);
              console.log(`[transferEther] Winner received ${prizeAmount} ETH`);

              setTimeout(() => {
                snackbarMessageRef.current = `Winner received ${prizeAmount} ETH`;
                setIsSnackbarOpen(true);
              }, 3000);
            });
        });
      })
      .then(() => {
        console.log('Winner details listener added');
      });

    return () => {
      voteContract.removeAllListeners(voteCastListener).then();
      voteContract.removeAllListeners(winnerDetailsListener).then();
    };
  }, [voteContract, candidateManagementContract, prizeAmount, gasLimitForLastTransaction, provider]);

  useEffect(() => {
    console.log('accounts: ', accounts);
  }, [accounts]);

  useEffect(() => {
    console.log('votes: ', votes);
  }, [votes]);

  useEffect(() => {
    console.log('hasVotedObject: ', hasVotedObject);

    if (hasVoteFinished) {
      snackbarMessageRef.current = 'Voting has finished';
      setIsSnackbarOpen(true);
      return;
    }

    if (hasVoteFinished === null) {
      return;
    }

    if (!accounts.length) {
      return;
    }

    const isMajorityReached =
      majorityThreshold && Object.keys(votes).some((candidate) => votes[candidate] >= majorityThreshold);

    if (!isMajorityReached && Object.keys(hasVotedObject).length < accounts.length) {
      return;
    }

    console.log('All accounts have voted');

    try {
      voteContract?.getWinner().then();
    } catch (error) {
      console.error('[transferEther] Error transferring ether: ', error);
      snackbarMessageRef.current = 'Error transferring ether';
      setIsSnackbarOpen(true);
    }
  }, [hasVotedObject, majorityThreshold, voteContract, candidateManagementContract, hasVoteFinished]);

  useEffect(() => {
    if (!voteContract) {
      return;
    }

    candidateManagementContract?.owner().then((fetchedOwner) => {
      setOwner(fetchedOwner);
    });

    voteContract.getVotesObject().then((fetchedVotesObject) => {
      let _votes: Record<string, number> = {};
      let _candidates: string[] = [];

      const len = fetchedVotesObject?.[0]?.length;

      for (let i = 0; i < len; i++) {
        _votes[fetchedVotesObject[0][i]] = Number(fetchedVotesObject[1][i]);
        _candidates.push(fetchedVotesObject[0][i]);
      }

      setVotes(_votes);
      setCandidates(_candidates);
    });

    voteContract.getHasVoted().then((fetchedHasVotedArray) => {
      console.log('fetchedHasVotedArray: ', fetchedHasVotedArray);
      let _hasVotedObject: Record<string, boolean> = {};

      const len = fetchedHasVotedArray?.length;

      for (let i = 0; i < len; i++) {
        _hasVotedObject[fetchedHasVotedArray[i]] = true;
      }

      setHasVotedObject(_hasVotedObject);
    });
  }, [voteContract, candidateManagementContract]);

  const onAddAsCandidateClick = async (account: Account) => {
    try {
      setPerformingTransaction(true);

      const transactionResponse = await candidateManagementContract?.addCandidate(account.address);
      await transactionResponse?.wait();
      console.log('[onAddAsCandidateClick] Added account as candidate');

      setCandidates([...candidates, account.address]);

      setVotes({ ...votes, [account.address]: 0 });
    } catch (error) {
      console.error('[onAddAsCandidateClick] Error adding account as candidate: ', error);
      snackbarMessageRef.current = 'Error adding account as candidate';
      setIsSnackbarOpen(true);
    } finally {
      setPerformingTransaction(false);
    }
  };

  const onRemoveAsCandidateClick = async (account: Account) => {
    try {
      setPerformingTransaction(true);

      const transactionResponse = await candidateManagementContract?.removeCandidate(account.address);
      await transactionResponse?.wait();
      console.log('[onRemoveAsCandidateClick] Removed account as candidate');

      setCandidates(candidates.filter((candidate) => candidate !== account.address));

      const _votes = { ...votes };
      delete _votes[account.address];
      setVotes(_votes);
    } catch (error) {
      console.error('[onRemoveAsCandidateClick] Error removing account as candidate: ', error);
      snackbarMessageRef.current = 'Error removing account as candidate';
      setIsSnackbarOpen(true);
    } finally {
      setPerformingTransaction(false);
    }
  };

  const onVoteClick = async (account: Account) => {
    try {
      setPerformingTransaction(true);

      const transactionResponse = await selectedContract?.vote(account.address, owner, {
        value: ethers.parseEther('100'),
      });
      await transactionResponse.wait();

      console.log('[onVoteClick] Voted for account');

      const _votes = { ...votes };
      _votes[account.address] = votes[account.address] ? votes[account.address] + 1 : 1;
      setVotes(_votes);

      const _hasVotedObject = { ...hasVotedObject };
      _hasVotedObject[selectedAccount] = true;
      setHasVotedObject(_hasVotedObject);
    } catch (error) {
      console.error('[onVoteClick] Error voting for account: ', error);
      snackbarMessageRef.current = 'Error voting for account';
      setIsSnackbarOpen(true);
    } finally {
      setPerformingTransaction(false);
    }
  };

  return (
    <LocalComponents.Container>
      {accounts.map((account, accountIndex) => (
        <LocalComponents.Account key={account.address}>
          <LocalComponents.AccountInformation>
            Account {accountIndex} {owner === account.address ? '(Owner)' : ''}{' '}
            {votes?.[account.address] !== undefined ? `(${votes[account.address]} votes)` : ''}
          </LocalComponents.AccountInformation>
          <LocalComponents.AccountInformationWrapper>
            <LocalComponents.AccountInformation>- Address: {account.address}</LocalComponents.AccountInformation>
            <LocalComponents.AccountInformation>- Balance: {account.balance}</LocalComponents.AccountInformation>
          </LocalComponents.AccountInformationWrapper>
          <LocalComponents.AccountButtonsWrapper>
            {selectedAccount === owner && (
              <>
                {candidates.includes(account.address) ? (
                  <Button
                    variant='contained'
                    color='error'
                    onClick={() => onRemoveAsCandidateClick(account)}
                    disabled={performingTransaction}>
                    Remove candidate
                  </Button>
                ) : (
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => onAddAsCandidateClick(account)}
                    disabled={performingTransaction}>
                    Add candidate
                  </Button>
                )}
              </>
            )}
            <>
              {selectedAccount && candidates.includes(account.address) && !hasVotedObject?.[selectedAccount] && (
                <Button
                  variant='contained'
                  color='success'
                  onClick={() => onVoteClick(account)}
                  disabled={performingTransaction}>
                  Vote
                </Button>
              )}
            </>
          </LocalComponents.AccountButtonsWrapper>
        </LocalComponents.Account>
      ))}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setIsSnackbarOpen(false)}
        message={snackbarMessageRef.current}
      />
    </LocalComponents.Container>
  );
};

export default Accounts;
