// Types
import type { Contract } from 'ethers';
import { Nullable, EmployeeDetails } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';

type UseRemunerationReturn = {
    details: Nullable<EmployeeDetails & { currentRemuneration: BigNumber }>;
    tokensClaimable: {
        name: string;
        symbol: string;
        address: string;
        redeemAmount: BigNumber;
    }[];
    claim: (tokenAddress: string) => Promise<void>;
};

/**
 * Custom hook to retrieve the user's remunerations details.
 *
 * @returns {UseRemunerationReturn} - The user's remunerations details.
 */
const useRemuneration = (): UseRemunerationReturn => {
    const { provider, userAddress } = useWeb3Context();

    const [details, setDetails] = useState<UseRemunerationReturn['details']>(null);
    const [tokensClaimable, setTokensClaimable] = useState<
        UseRemunerationReturn['tokensClaimable']
    >([]);

    /**
     * Fetches the tokens claimable.
     *
     * @private
     * @param {Contract} caoContract - The cao contract.
     * @param {Contract} caoParametersContract - The cao parameters contract.
     * @param {Contract} erc20Contract - The address-less erc20 token contract.
     * @returns {Promise<UseRemunerationReturn['tokensClaimable']>} - The fetched tokens details.
     */
    const _fetchTokensClaimable = async (
        caoContract: Contract,
        caoParametersContract: Contract,
        erc20Contract: Contract
    ): Promise<UseRemunerationReturn['tokensClaimable']> =>
        // Users can claim either fund tokens or reserve tokens
        [
            ...(await caoParametersContract.getFundTokens()),
            ...(await caoParametersContract.getReserveTokens())
        ].reduce(async (current, tokenAddress) => {
            const [redeemAmount, caoBalance]: [BigNumber, BigNumber] = await Promise.all([
                caoContract.computeTokenRedeemAmount(tokenAddress),
                erc20Contract.attach(tokenAddress).balanceOf(addresses.cao)
            ]);

            // Exclude if cao does not have enough balance
            if (caoBalance.lt(redeemAmount)) return current;

            // Include the token as claimable
            const [name, symbol] = await Promise.all([
                erc20Contract.attach(tokenAddress).name(),
                erc20Contract.attach(tokenAddress).symbol()
            ]);
            return [...(await current), { name, symbol, address: tokenAddress, redeemAmount }];
        }, Promise.resolve([]) as Promise<UseRemunerationReturn['tokensClaimable']>);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!provider || !userAddress) return;
            const hrContract = contracts.hr.connect(provider);
            const caoContract = contracts.cao.connect(provider);
            const caoParametersContract = contracts.caoParameters.connect(provider);
            const erc20Contract = contracts.erc20.connect(provider);

            // Get the details
            const [employeeResponse, [currentRemunerationResponse], tokensClaimableResponse] =
                await Promise.all([
                    hrContract.getEmployeeByAddress(userAddress),
                    hrContract.getEmployeeCurrentRemuneration(userAddress),
                    _fetchTokensClaimable(caoContract, caoParametersContract, erc20Contract)
                ]);

            setDetails({ ...employeeResponse, currentRemuneration: currentRemunerationResponse });
            setTokensClaimable(tokensClaimableResponse);

            // Listen to redemption events
            caoContract.on(caoContract.filters.RemunerationRedeemed(userAddress), async () => {
                const [employeeResponse, [currentRemunerationResponse], tokensClaimableResponse] =
                    await Promise.all([
                        hrContract.getEmployeeByAddress(userAddress),
                        hrContract.getEmployeeCurrentRemuneration(userAddress),
                        _fetchTokensClaimable(caoContract, caoParametersContract, erc20Contract)
                    ]);

                setDetails({
                    ...employeeResponse,
                    currentRemuneration: currentRemunerationResponse
                });
                setTokensClaimable(tokensClaimableResponse);
            });
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, userAddress]);

    /**
     * Function for the user to claim the accrued remunerations
     *
     * @param {number} tokenAddress - The address of the token to claim.
     */
    const claim = async (tokenAddress: string): Promise<void> => {
        if (!provider) return;
        await contracts.cao.connect(provider.getSigner()).redeemRemuneration(tokenAddress);
    };

    return { details, tokensClaimable, claim };
};

export default useRemuneration;
