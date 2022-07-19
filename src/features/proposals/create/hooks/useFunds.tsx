// Types
import type { Contract } from 'ethers';
import { Nullable } from '@interfaces/general';
import { AddressesOptions } from '../interfaces';

// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseFundsReturn = {
    addressesOptions: Nullable<AddressesOptions>;
};

/**
 * Custom hook to retrieve details about the CAO.
 *
 * @returns {UseFundsReturn} - The funds' details.
 */
const useFunds = (): UseFundsReturn => {
    const { provider } = useWeb3Context();

    const [addressesOptions, setAddressesOptions] =
        useState<UseFundsReturn['addressesOptions']>(null);

    /**
     * Fetches the funds' addresses options.
     *
     * @private
     * @param {Contract} caoParametersContract - The cao contract.
     * @param {Contract} mainFundContract - The address-less main fund contract.
     * @param {Contract} mainFundTokenContract - The address-less main fund token contract.
     * @returns {Promise<UseFundsReturn['addresses']>} - The fetched funds' details.
     */
    const _fetchAddressesOptions = async (
        caoParametersContract: Contract,
        mainFundContract: Contract,
        mainFundTokenContract: Contract
    ): Promise<UseFundsReturn['addressesOptions']> => {
        const response = await Promise.all(
            ((await caoParametersContract.getFundTokens()) as string[]).map(
                async (mainFundToken) => {
                    const attachedMainFundTokenContract =
                        mainFundTokenContract.attach(mainFundToken);
                    const mainFund: string = await attachedMainFundTokenContract.getFundAddress();
                    const attachedMainFundContract = mainFundContract.attach(mainFund);

                    return {
                        name: `${await attachedMainFundTokenContract.name()} (${mainFund})`,
                        mainFund,
                        mainFundToken,
                        accounting: (await attachedMainFundContract.getAccounting()) as string,
                        frontOffice: (await attachedMainFundContract.getFrontOffice()) as string,
                        incentivesManager:
                            (await attachedMainFundContract.getIncentivesManager()) as string
                    };
                }
            )
        );

        // Reduce into the format we want
        return response.reduce(
            (current, next) => ({
                mainFund: [...current.mainFund, { label: next.name, value: next.mainFund }],
                mainFundToken: [
                    ...current.mainFundToken,
                    { label: next.name, value: next.mainFundToken }
                ],
                accounting: [...current.accounting, { label: next.name, value: next.accounting }],
                frontOffice: [
                    ...current.frontOffice,
                    { label: next.name, value: next.frontOffice }
                ],
                incentivesManager: [
                    ...current.incentivesManager,
                    { label: next.name, value: next.frontOffice }
                ]
            }),
            {
                mainFund: [],
                mainFundToken: [],
                accounting: [],
                frontOffice: [],
                incentivesManager: []
            } as NonNullable<UseFundsReturn['addressesOptions']>
        );
    };

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!provider) return;
            const caoParametersContract = contracts.caoParameters.connect(provider);
            const mainFundContract = contracts.mainFund.connect(provider);
            const mainFundTokenContract = contracts.mainFundToken.connect(provider);

            // Get the funds addresses options
            const addressesOptionsResponse = await _fetchAddressesOptions(
                caoParametersContract,
                mainFundContract,
                mainFundTokenContract
            );
            setAddressesOptions(addressesOptionsResponse);
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    return { addressesOptions };
};

export default useFunds;
