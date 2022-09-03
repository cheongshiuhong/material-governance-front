// Types
import type { Contract } from 'ethers';
import type { Nullable, FundDetails } from '@interfaces/general';
import type { BigNumber } from '@ethersproject/bignumber';

// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseIncentivesManagerReturn = {
    incentives: {
        address: string;
        name: string;
        incentiveBalance: BigNumber;
    }[];
};

/**
 * Custom hook to retrieve details about the incentives manager contract.
 *
 * @param {Nullable<FundDetails>} fundDetails - The address of the incentives manager contract.
 * @returns {UseIncentivesManagerReturn} - The incentives manager details.
 */
const useIncentivesManager = (fundDetails: Nullable<FundDetails>): UseIncentivesManagerReturn => {
    const { readProvider } = useWeb3Context();

    const [incentives, setIncentives] = useState<UseIncentivesManagerReturn['incentives']>([]);

    /**
     * Fetches the incentives details.
     *
     * @private
     * @param {Contract} mainFundTokenContract - The main fund token contract.
     * @param {Contract} incentivesManagerContract - The incentives manager contract.
     * @param {Contract} incentiveContract - The address-less incentive contract.
     * @returns {Promise<UseIncentivesManagerReturn['incentives']>} - The fetched incentives details.
     */
    const _fetchIncentives = async (
        mainFundTokenContract: Contract,
        incentivesManagerContract: Contract,
        incentiveContract: Contract
    ): Promise<UseIncentivesManagerReturn['incentives']> =>
        Promise.all(
            ((await incentivesManagerContract.getIncentives()) as string[]).map(
                async (address) => ({
                    address,
                    name: await incentiveContract.attach(address).getName(),
                    incentiveBalance: await mainFundTokenContract.balanceOf(address)
                })
            )
        );

    /** Effect for initial load when provider and address are ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider || !fundDetails) return;
            const mainFundTokenContract = contracts.mainFundToken
                .connect(readProvider)
                .attach(fundDetails.mainFundTokenAddress);
            const incentivesManagerContract = contracts.incentivesManager
                .connect(readProvider)
                .attach(fundDetails.incentivesManagerAddress);
            const incentiveContract = contracts.iincentive.connect(readProvider);

            const incentivesResponse = await _fetchIncentives(
                mainFundTokenContract,
                incentivesManagerContract,
                incentiveContract
            );

            setIncentives(incentivesResponse);
        };

        loadInitial();
    }, [readProvider, fundDetails]);

    return { incentives };
};

export default useIncentivesManager;
