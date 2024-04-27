import { LocalComponents } from './styled.ts';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Account } from '../../types.ts';
import { Button } from '@mui/material';
import { ethers } from 'ethers';

const WIN_AMOUNT_ETH = '5000000';

const Accounts = ({
  provider,
  accounts,
  voteContract,
  performingTransaction,
  setPerformingTransaction,
  selectedAccount,
  selectedContract,
}: {
  provider: ethers.JsonRpcProvider | null;
  accounts: Account[];
  voteContract: ethers.Contract | null;
  performingTransaction: boolean;
  setPerformingTransaction: Dispatch<SetStateAction<boolean>>;
  selectedAccount: string;
  selectedContract: ethers.Contract | undefined;
}) => {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [hasVotedObject, setHasVotedObject] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log('accounts: ', accounts);
  }, [accounts]);

  useEffect(() => {
    console.log('votes: ', votes);
  }, [votes]);

  useEffect(() => {
    console.log('hasVotedObject: ', hasVotedObject);

    if (!accounts.length || Object.keys(hasVotedObject).length < accounts.length - 1) {
      return;
    }

    console.log('All accounts have voted');
    voteContract?.getWinner().then((winnerObject) => {
      console.log('Winner: ', winnerObject[0], ' with ', Number(winnerObject[1]), ' votes');

      provider?.getSigner().then((signer) => {
        signer
          ?.sendTransaction({ to: winnerObject[0], value: ethers.parseUnits(WIN_AMOUNT_ETH, 'ether') })
          .then((transactionResponse) => {
            console.log(`[transferEther] Transaction hash: ${transactionResponse.hash}`);
            console.log(`[transferEther] Waiting for transaction to be mined...`);
            transactionResponse.wait().then((receipt: any) => {
              console.log(`[transferEther] Transaction was mined in block: ${receipt.blockNumber}`);
            });
            console.log(`[transferEther] Transaction was successful`);
            console.log(`[transferEther] Winner received ${WIN_AMOUNT_ETH} ETH`);

            setVotes({});
            setCandidates([]);
            setHasVotedObject({});

            voteContract?.resetVotingInstance().then(() => {
              console.log('Voting instance reset');
            });
          });
      });
    });
  }, [hasVotedObject]);

  useEffect(() => {
    if (!voteContract) {
      return;
    }

    voteContract.getOwner().then((fetchedOwner) => {
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
      let _hasVotedObject: Record<string, boolean> = {};

      const len = fetchedHasVotedArray?.length;

      for (let i = 0; i < len; i++) {
        _hasVotedObject[fetchedHasVotedArray[i]] = true;
      }

      setHasVotedObject(_hasVotedObject);
    });
  }, [voteContract]);

  const onAddAsCandidateClick = async (account: Account) => {
    try {
      setPerformingTransaction(true);

      const transactionResponse = await voteContract?.addCandidate(account.address);
      await transactionResponse?.wait();
      console.log('[onAddAsCandidateClick] Added account as candidate');

      setCandidates([...candidates, account.address]);

      setVotes({ ...votes, [account.address]: 0 });
    } catch (error) {
      console.error('[onAddAsCandidateClick] Error adding account as candidate: ', error);
    } finally {
      setPerformingTransaction(false);
    }
  };

  const onRemoveAsCandidateClick = async (account: Account) => {
    try {
      setPerformingTransaction(true);

      const transactionResponse = await voteContract?.removeCandidate(account.address);
      await transactionResponse?.wait();
      console.log('[onRemoveAsCandidateClick] Removed account as candidate');

      setCandidates(candidates.filter((candidate) => candidate !== account.address));

      const _votes = { ...votes };
      delete _votes[account.address];
      setVotes(_votes);
    } catch (error) {
      console.error('[onRemoveAsCandidateClick] Error removing account as candidate: ', error);
    } finally {
      setPerformingTransaction(false);
    }
  };

  const onVoteClick = async (account: Account) => {
    try {
      setPerformingTransaction(true);

      const transactionResponse = await selectedContract?.vote(account.address);
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
            {selectedAccount === owner ? (
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
            ) : (
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
            )}
          </LocalComponents.AccountButtonsWrapper>
        </LocalComponents.Account>
      ))}
    </LocalComponents.Container>
  );
};

export default Accounts;
