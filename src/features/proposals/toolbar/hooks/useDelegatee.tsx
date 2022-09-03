// Types
import { Nullable } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseDelegateeReturn = {
    delegatee: Nullable<string>;
    delegate: (delegatee: string) => Promise<void>;
};

/**
 * Custom hook to read the delegatee and set the delegatee.
 *
 * @returns {UseDelegateeReturn} - The delegatee and the delegatee setter.
 */
const useDelegatee = (): UseDelegateeReturn => {
    const { writeProvider, userAddress } = useWeb3Context();
    const caoTokenContract = writeProvider && contracts.caoToken.connect(writeProvider.getSigner());

    const [delegatee, setDelegatee] = useState<string | null>(null);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!userAddress || !caoTokenContract) return;

            // Read and set the delegatee
            const currentDelegatee: string = (
                await caoTokenContract.functions.delegates(userAddress)
            )[0];
            setDelegatee(currentDelegatee);
        };

        loadInitial();
    }, [userAddress, caoTokenContract]);

    /**
     * Function to delegate to a user.
     *
     * @param {string} newDelegatee - The new delegatee to be set.
     */
    const delegate = async (newDelegatee: string) => {
        if (!writeProvider || !caoTokenContract) return;

        // Make the transaction
        await caoTokenContract.functions.delegate(newDelegatee);

        // Read and set the delegatee again
        const currentDelegatee: string = (
            await caoTokenContract.functions.delegates(userAddress)
        )[0];
        setDelegatee(currentDelegatee);
    };

    return { delegatee, delegate };
};

export default useDelegatee;
