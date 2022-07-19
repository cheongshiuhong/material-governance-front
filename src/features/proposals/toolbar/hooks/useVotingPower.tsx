// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseVotingPowerReturn = {
    votingPower: BigNumber;
    totalVotingPower: BigNumber;
};

/**
 * Custom hook to read the voting power.
 *
 * @returns {UseVotingPowerReturn} - The detail about voting power.
 */
const UseVotingPower = (): UseVotingPowerReturn => {
    const { provider, userAddress } = useWeb3Context();
    const caoTokenContract = provider && contracts.caoToken.connect(provider);

    const [votingPower, setVotingPower] = useState<BigNumber>(BigNumber.from(0));
    const [totalVotingPower, setTotalVotingPower] = useState<BigNumber>(BigNumber.from(0));

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!userAddress || !caoTokenContract) return;

            // Read and set the delegatee
            const currentVotingPower: BigNumber = (
                await caoTokenContract.functions.getVotes(userAddress)
            )[0];
            const currentTotalVotingPower: BigNumber = (
                await caoTokenContract.functions.totalSupply()
            )[0];

            setVotingPower(currentVotingPower);
            setTotalVotingPower(currentTotalVotingPower);
        };

        loadInitial();
    }, [userAddress, caoTokenContract]);

    return { votingPower, totalVotingPower };
};

export default UseVotingPower;
