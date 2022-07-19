// Types
import type { Contract } from 'ethers';
import type { BigNumber } from '@ethersproject/bignumber';
import type { FundDetails } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';

type UseCAOReturn = {
    reserveTokens: {
        address: string;
        symbol: string;
        oracle: string;
        caoBalance: BigNumber;
    }[];
    funds: FundDetails[];
};

/**
 * Custom hook to retrieve details about the CAO.
 *
 * @returns {UseCAOReturn} - The cao's details.
 */
const useCAO = (): UseCAOReturn => {
    const { provider } = useWeb3Context();

    const [reserveTokens, setReserveTokens] = useState<UseCAOReturn['reserveTokens']>([]);
    const [funds, setFunds] = useState<UseCAOReturn['funds']>([]);

    /**
     * Fetches the reserve tokens details.
     *
     * @private
     * @param {Contract} caoParametersContract - The cao parameters contract.
     * @param {Contract} erc20Contract - The address-less erc20 token contract.
     * @returns {Promise<UseCAOReturn['reserveTokens']>} - The fetched reserve tokens' details.
     */
    const _fetchReserveTokens = async (
        caoParametersContract: Contract,
        erc20Contract: Contract
    ): Promise<UseCAOReturn['reserveTokens']> =>
        Promise.all(
            ((await caoParametersContract.getReserveTokens()) as string[]).map(async (address) => ({
                address,
                symbol: await erc20Contract.attach(address).symbol(),
                oracle: await caoParametersContract.getReserveTokenOracle(address),
                caoBalance: await erc20Contract.attach(address).balanceOf(addresses.cao)
            }))
        );

    /**
     * Fetches the funds details.
     *
     * @private
     * @param {Contract} caoParametersContract - The cao parameters contract.
     * @param {Contract} mainFundContract - The address-less main fund contract.
     * @param {Contract} mainFundTokenContract - The address-less main fund token contract.
     * @returns {Promise<UseCAOReturn['funds']>} - The fetched fund details.
     */
    const _fetchFunds = async (
        caoParametersContract: Contract,
        mainFundContract: Contract,
        mainFundTokenContract: Contract
    ): Promise<UseCAOReturn['funds']> =>
        Promise.all(
            ((await caoParametersContract.getFundTokens()) as string[]).map(
                async (mainFundTokenAddress) => {
                    const attachedMainFundTokenContract = await mainFundTokenContract.attach(
                        mainFundTokenAddress
                    );
                    const mainFundAddress: string = attachedMainFundTokenContract.getFundAddress();
                    const attachedMainFundContract = mainFundContract.attach(mainFundAddress);
                    return {
                        name: await attachedMainFundTokenContract.name(),
                        mainFundAddress,
                        mainFundTokenAddress,
                        accountingAddress:
                            (await attachedMainFundContract.getAccounting()) as string,
                        frontOfficeAddress:
                            (await attachedMainFundContract.getFrontOffice()) as string,
                        incentivesManagerAddress:
                            (await attachedMainFundContract.getIncentivesManager()) as string,
                        caoFTBalance: await attachedMainFundTokenContract.balanceOf(addresses.cao)
                    };
                }
            )
        );

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!provider) return;
            const caoParametersContract = contracts.caoParameters.connect(provider);
            const erc20Contract = contracts.erc20.connect(provider);
            const mainFundContract = contracts.mainFund.connect(provider);
            const mainFundTokenContract = contracts.mainFundToken.connect(provider);

            // Get the reserve tokens and funds
            const [reserveTokensResponse, fundsResponse] = await Promise.all([
                _fetchReserveTokens(caoParametersContract, erc20Contract),
                _fetchFunds(caoParametersContract, mainFundContract, mainFundTokenContract)
            ]);

            setReserveTokens(reserveTokensResponse);
            setFunds(fundsResponse);
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    return { reserveTokens, funds };
};

export default useCAO;
