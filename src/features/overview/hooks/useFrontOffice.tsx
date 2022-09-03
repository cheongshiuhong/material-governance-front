// Types
import type { Contract } from 'ethers';
import type { Nullable, FundDetails } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseFrontOfficeReturn = {
    // States
    frontOfficeFTBalance: BigNumber;
    // Parameters
    allowedTokens: {
        address: string;
        symbol: string;
        oracle: string;
        frontOfficeBalance: BigNumber;
    }[];
    maxSingleWithdrawalFundTokenAmount: Nullable<BigNumber>;
};

/**
 * Custom hook to retrieve details about the front office contract.
 *
 * @param {Nullable<FundDetails>} fundDetails - The fund details.
 * @returns {UseFrontOfficeReturn} - The front office details.
 */
const useFrontOffice = (fundDetails: Nullable<FundDetails>): UseFrontOfficeReturn => {
    const { readProvider } = useWeb3Context();

    const [frontOfficeFTBalance, setFrontOfficeFTBalance] = useState<
        UseFrontOfficeReturn['frontOfficeFTBalance']
    >(BigNumber.from(0));
    const [allowedTokens, setAllowedTokens] = useState<UseFrontOfficeReturn['allowedTokens']>([]);
    const [maxSingleWithdrawalFundTokenAmount, setMaxSingleWithdrawalFundTokenAmount] =
        useState<UseFrontOfficeReturn['maxSingleWithdrawalFundTokenAmount']>(null);

    /**
     * Fetches the allowed tokens details.
     *
     * @private
     * @param {Contract} erc20Contract - The address-less erc20 token contract.
     * @param {Contract} frontOfficeParametersContract - The front office parameters contract.
     * @returns {Promise<UseFrontOfficeReturn['allowedTokens']>} - The fetched allowed tokens details.
     */
    const _fetchAllowedTokens = async (
        erc20Contract: Contract,
        frontOfficeParametersContract: Contract
    ): Promise<UseFrontOfficeReturn['allowedTokens']> =>
        Promise.all(
            ((await frontOfficeParametersContract.getAllowedTokens()) as string[]).map(
                async (tokenAddress) => ({
                    address: tokenAddress,
                    symbol: await erc20Contract.attach(tokenAddress).symbol(),
                    oracle: await frontOfficeParametersContract.getAllowedTokenOracle(tokenAddress),
                    frontOfficeBalance: await erc20Contract
                        .attach(tokenAddress)
                        .balanceOf(fundDetails?.frontOfficeAddress)
                })
            )
        );

    /** Effect for initial load when provider and address are ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider || !fundDetails) return;
            const erc20Contract = contracts.erc20.connect(readProvider);
            const mainFundTokenContract = contracts.mainFundToken
                .connect(readProvider)
                .attach(fundDetails.mainFundTokenAddress);
            const frontOfficeContract = contracts.frontOffice
                .connect(readProvider)
                .attach(fundDetails.frontOfficeAddress);

            // Fetch the parameters address
            const parametersAddress = await frontOfficeContract.getParametersAddress();
            const frontOfficeParametersContract = contracts.frontOfficeParameters
                .connect(readProvider)
                .attach(parametersAddress);

            const [
                frontOfficeFTBalanceResponse,
                allowedTokensResponse,
                maxSingleWithdrawalFundTokenAmountResponse
            ] = await Promise.all([
                mainFundTokenContract.balanceOf(fundDetails.frontOfficeAddress),
                _fetchAllowedTokens(erc20Contract, frontOfficeParametersContract),
                frontOfficeParametersContract.getMaxSingleWithdrawalFundTokenAmount()
            ]);

            setFrontOfficeFTBalance(frontOfficeFTBalanceResponse);
            setAllowedTokens(allowedTokensResponse);
            setMaxSingleWithdrawalFundTokenAmount(maxSingleWithdrawalFundTokenAmountResponse);
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider, fundDetails]);

    return { frontOfficeFTBalance, allowedTokens, maxSingleWithdrawalFundTokenAmount };
};

export default useFrontOffice;
