// Types
import type { Nullable, Proposal, Vote } from '@interfaces/general';
import type { Event } from 'ethers';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseProposalReturn = {
    isLoading: boolean;
    currentBlock: number;
    proposal: Nullable<Proposal>;
    votes: Vote[];
    votingPower: BigNumber;
    totalVotingPower: BigNumber;
    hasUserVoted: boolean;
    castVote: (direction: number, reason: string) => Promise<void>;
    isExecutable: boolean;
    execute: () => Promise<void>;
};

/**
 * Custom hook to retrieve the proposal with the voting event logs.
 *
 * @param {string} id - The proposal id to retrieve.
 * @returns {UseProposalReturn} - The proposal details object.
 */
const useProposal = (id: string): UseProposalReturn => {
    const { readProvider, writeProvider, userAddress } = useWeb3Context();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentBlock, setCurrentBlock] = useState<number>(0);
    const [proposal, setProposal] = useState<Nullable<Proposal>>(null);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [votingPower, setVotingPower] = useState<BigNumber>(BigNumber.from(0));
    const [totalVotingPower, setTotalVotingPower] = useState<BigNumber>(BigNumber.from(0));
    const [isExecutable, setIsExecutable] = useState<boolean>(false);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider) return;
            const caoContract = contracts.cao.connect(readProvider);
            const caoTokenContract = contracts.caoToken.connect(readProvider);

            setIsLoading(true);

            // Read the current block
            const currentBlockResponse = await readProvider.getBlockNumber();
            setCurrentBlock(currentBlockResponse);

            // Subscribe to new blocks
            readProvider.addListener('block', setCurrentBlock);

            try {
                // Retrieve the proposal
                const proposalResponse = await caoContract.getProposal(id);
                setProposal({ id, ...proposalResponse });

                // Get the votes for the proposal (batch by 5000 blocks)
                const voteFilter = caoContract.filters.Vote(id);
                const startBlock = proposalResponse.startBlock.toNumber();
                const endBlock = proposalResponse.endBlock.toNumber();
                const numBatches =
                    Math.floor((endBlock - startBlock) / 5000) +
                    ((endBlock - startBlock) % 5000 === 0 ? 0 : 1);
                const votesResponse: Event[] = await Array(numBatches)
                    .fill(1)
                    .reduce(
                        async (current, _, index) => [
                            ...(await current),
                            ...(await caoContract.queryFilter(
                                voteFilter,
                                startBlock + index * 5000,
                                startBlock + (index + 1) * 5000
                            ))
                        ],
                        Promise.resolve([]) as Promise<Event[]>
                    );
                const parsedVotes: Vote[] = [];
                votesResponse.forEach((voteResponse) => {
                    parsedVotes.push({
                        voter: voteResponse.args?.voter as string,
                        direction: voteResponse.args?.direction as number,
                        votingPower: voteResponse.args?.votingPower as BigNumber,
                        reason: voteResponse.args?.reason as string
                    });
                });
                setVotes(parsedVotes);

                // Subscribe to votes
                caoContract.on(
                    voteFilter,
                    async (
                        _,
                        voter: string,
                        direction: number,
                        votingPower: BigNumber,
                        reason: string
                    ) => {
                        // Update the votes
                        setVotes((votes) =>
                            votes.some((vote) => vote.voter === voter)
                                ? votes
                                : [...votes, { voter, direction, votingPower, reason }]
                        );

                        // Check if executable
                        const isExecutableResponse = await caoContract.getIsProposalExecutable(id);
                        setIsExecutable(isExecutableResponse);
                    }
                );

                // Subscribe to executions
                caoContract.on(caoContract.filters.ProposalExecuted(id), async (_) => {
                    setProposal({ id, ...(await caoContract.getProposal(id)) });
                    setIsExecutable(await caoContract.getIsProposalExecutable(id));
                });

                // Get the voting power if past start block
                if (proposalResponse.startBlock.lt(currentBlockResponse)) {
                    setVotingPower(
                        await caoTokenContract.getPastVotes(
                            userAddress,
                            proposalResponse.startBlock
                        )
                    );
                    setTotalVotingPower(
                        await caoTokenContract.getPastTotalSupply(proposalResponse.startBlock)
                    );

                    // Check if executable
                    setIsExecutable(await caoContract.getIsProposalExecutable(id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitial();

        return () => {
            readProvider && readProvider.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider]);

    /**
     * Function to cast a vote.
     *
     * @param {number} direction - The direction of the vote;
     * @param {string} reason - The reason provided by the user.
     */
    const castVote = async (direction: number, reason: string): Promise<void> => {
        if (!writeProvider || !proposal) return;
        await contracts.cao.connect(writeProvider.getSigner()).vote(proposal.id, direction, reason);
    };

    /** Function to execute a proposal. */
    const execute = async (): Promise<void> => {
        if (!writeProvider || !proposal) return;
        await contracts.cao.connect(writeProvider.getSigner()).executeProposal(proposal.id);
    };

    return {
        isLoading,
        currentBlock,
        proposal,
        votes,
        votingPower,
        totalVotingPower,
        hasUserVoted: votes.some((vote) => vote.voter === userAddress),
        castVote,
        isExecutable,
        execute
    };
};

export default useProposal;
