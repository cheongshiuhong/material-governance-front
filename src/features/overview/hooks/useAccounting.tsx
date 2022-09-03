// Types
import type { Nullable, FundDetails } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseAccountingReturn = {
    accountingFTBalance: BigNumber;
    fundTokenPrice: Nullable<BigNumber>;
    state: Nullable<{
        aumValue: BigNumber;
        periodBeginningBlock: BigNumber;
        periodBeginningAum: BigNumber;
        periodBeginningSupply: BigNumber;
        theoreticalSupply: BigNumber;
    }>;
    // Parameters
    managementFee: Nullable<BigNumber>;
    evaluationPeriodBlocks: Nullable<number>;
};

/**
 * Custom hook to retrieve details about the accounting contract.
 *
 * @param {Nullable<FundDetails>} fundDetails - The fund details.
 * @returns {UseAccountingReturn} - The accounting details.
 */
const useAccounting = (fundDetails: Nullable<FundDetails>): UseAccountingReturn => {
    const { readProvider } = useWeb3Context();

    const [accountingFTBalance, setAccountingFTBalance] = useState<
        UseAccountingReturn['accountingFTBalance']
    >(BigNumber.from(0));

    const [fundTokenPrice, setFundTokenPrice] =
        useState<UseAccountingReturn['fundTokenPrice']>(null);
    const [state, setState] = useState<UseAccountingReturn['state']>(null);
    const [managementFee, setManagementFee] = useState<UseAccountingReturn['managementFee']>(null);
    const [evaluationPeriodBlocks, setEvaluationPeriodBlocks] =
        useState<UseAccountingReturn['evaluationPeriodBlocks']>(null);

    /** Effect for initial load when provider and address are ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider || !fundDetails) return;
            const mainFundTokenContract = contracts.mainFundToken
                .connect(readProvider)
                .attach(fundDetails.mainFundTokenAddress);
            const accountingContract = contracts.accounting
                .connect(readProvider)
                .attach(fundDetails.accountingAddress);

            // Fetch the details
            const [
                accountingFTBalanceResponse,
                [fundTokenPriceResponse],
                stateResponse,
                managementFeeResponse,
                evaluationPeriodBlocksResponse
            ] = await Promise.all([
                mainFundTokenContract.balanceOf(fundDetails.accountingAddress),
                accountingContract.getFundTokenPrice(),
                accountingContract.getState(),
                accountingContract.getManagementFee(),
                accountingContract.getEvaluationPeriodBlocks()
            ]);

            setAccountingFTBalance(accountingFTBalanceResponse);
            setFundTokenPrice(fundTokenPriceResponse);
            setState(stateResponse);
            setManagementFee(managementFeeResponse);
            setEvaluationPeriodBlocks(evaluationPeriodBlocksResponse);
        };

        loadInitial();
    }, [readProvider, fundDetails]);

    return {
        accountingFTBalance,
        fundTokenPrice,
        state,
        managementFee,
        evaluationPeriodBlocks
    };
};

export default useAccounting;
