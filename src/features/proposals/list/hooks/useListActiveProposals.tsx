// Types
import type { Proposal } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseListActiveProposalsReturn = {
    activeProposals: Proposal[];
};

/**
 * Custom hook to list the active proposals.
 *
 * @returns {UseListActiveProposalsReturn} - The proposals details object.
 */
const useListActiveProposals = (): UseListActiveProposalsReturn => {
    const { readProvider } = useWeb3Context();

    const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider) return;
            const caoContract = contracts.cao.connect(readProvider);

            // Fetch the current active proposals
            const activeProposalsIdsResponse: BigNumber[] =
                await caoContract.getActiveProposalsIds();
            const activeProposalsResponse = await Promise.all(
                activeProposalsIdsResponse.map(async (id) => {
                    const activeProposalResponse = await caoContract.getProposal(id);
                    return { id, ...activeProposalResponse };
                })
            );
            setActiveProposals(activeProposalsResponse.reverse());

            // Listen to any new proposals created
            caoContract.on(caoContract.filters.ProposalCreated(), async (id: BigNumber) => {
                const newProposalResponse = await caoContract.getProposal(id);
                setActiveProposals((activeProposals) =>
                    // Only set if new proposal is pending and not already shown
                    newProposalResponse.status !== 0 ||
                    activeProposals.some((proposal) => proposal.id.eq(id))
                        ? activeProposals
                        : [{ id, ...newProposalResponse }, ...activeProposals]
                );
            });
        };

        loadInitial();

        return () => {
            readProvider && readProvider.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider]);

    return { activeProposals };
};

export default useListActiveProposals;
