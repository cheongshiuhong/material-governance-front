// Types
import type { Proposal } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseListAllProposalsReturn = {
    allProposals: Proposal[];
    total: BigNumber;
    hasMore: boolean;
    loadMore: () => Promise<void>;
};

/**
 * Custom hook to list the all proposals.
 *
 * @returns {UseListAllProposalsReturn} - The proposals details object.
 */
const useListAllProposals = (): UseListAllProposalsReturn => {
    const { readProvider } = useWeb3Context();

    const [allProposals, setAllProposals] = useState<Proposal[]>([]);
    const [total, setTotal] = useState<BigNumber>(BigNumber.from(0));
    const [earliestFetchedId, setEarliestFetchedId] = useState<BigNumber>(BigNumber.from(-1));

    /**
     * Fetches the proposals for the input array of ids.
     *
     * @param {number[]} idsToFetch - The array of ids of proposals to fetch.
     * @returns {Promise<void>} - Does not return anything.
     */
    const _fetchProposals = async (idsToFetch: BigNumber[]): Promise<void> => {
        if (!readProvider) return;
        const caoContract = contracts.cao.connect(readProvider);

        const batchedProposalsResponse = await Promise.all(
            idsToFetch.map(async (id) => {
                const batchedProposalResponse = await caoContract.getProposal(id);
                return { id, ...batchedProposalResponse };
            })
        );
        setAllProposals(batchedProposalsResponse);
        setEarliestFetchedId(idsToFetch[idsToFetch.length - 1] || BigNumber.from(-1));
    };

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider) return;
            const caoContract = contracts.cao.connect(readProvider);

            const numProposalsResponse: BigNumber = await caoContract.getNumProposals();
            const numToFetch = numProposalsResponse.lt(10) ? numProposalsResponse.toNumber() : 10;
            const idsToFetch = Array.from(Array(numToFetch).keys()).map((_, i) =>
                numProposalsResponse.sub(i + 1)
            );

            setTotal(numProposalsResponse);
            await _fetchProposals(idsToFetch);
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider]);

    /** Loads more proposals */
    const loadMore = async (): Promise<void> => {
        // Exit if nothing more to fetch
        if (earliestFetchedId === BigNumber.from(0)) return;

        const numToFetch = earliestFetchedId.lt(10) ? earliestFetchedId.toNumber() : 10;
        const idsToFetch = Array.from(Array(numToFetch).keys()).map((_, i) =>
            earliestFetchedId.sub(i + 1)
        );

        await _fetchProposals(idsToFetch);
    };

    return {
        allProposals,
        total,
        hasMore: earliestFetchedId.gt(0),
        loadMore
    };
};

export default useListAllProposals;
