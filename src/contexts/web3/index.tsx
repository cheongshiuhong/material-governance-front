// Types
import type { WrapperProps } from '@interfaces/general';
import type { Web3Provider } from '@ethersproject/providers';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useEffect } from 'react';
import { providers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import Web3Modal from 'web3modal';

// Code
import contracts from '@constants/contracts';
import authRoutes from './authRoutes';
import providerOptions from './providerOptions';

interface IWeb3Context {
    isLoading: boolean;
    provider: Web3Provider | null;
    chainId: number | null;
    userAddress: string | null;
    userState: {
        caoTokenBalance: BigNumber;
        remunerationPerBlock: BigNumber;
        remunerationValue: BigNumber;
    };
    allowedRoutes: string[];
    connectWallet: () => Promise<void>;
}

/** Context default fallback values */
const DEFAULT_USER_STATE = {
    caoTokenBalance: BigNumber.from(0),
    remunerationPerBlock: BigNumber.from(0),
    remunerationValue: BigNumber.from(0)
};
const Web3Context = createContext<IWeb3Context>({
    isLoading: false,
    provider: null,
    chainId: null,
    userAddress: null,
    userState: DEFAULT_USER_STATE,
    allowedRoutes: [],
    connectWallet: async () => console.warn('No context provided.')
});

/**
 * Context hook.
 *
 * @returns {IWeb3Context} - The context object.
 */
export const useWeb3Context = (): IWeb3Context => useContext(Web3Context);

/**
 * Web3 context provider.
 *
 * @param {WrapperProps} props - The children to provide context to.
 * @returns {ReactElement} - The children with the context provided.
 */
export const Web3ContextProvider: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);
    const [provider, setProvider] = useState<IWeb3Context['provider']>(null);
    const [chainId, setChainId] = useState<IWeb3Context['chainId']>(null);
    const [userAddress, setUserAddress] = useState<IWeb3Context['userAddress']>(null);
    const [userState, setUserState] = useState<IWeb3Context['userState']>(DEFAULT_USER_STATE);

    /** Effect to setup the web3 modal */
    useEffect(() => {
        /** Web3 provider setup */
        setWeb3Modal(
            new Web3Modal({
                cacheProvider: true,
                providerOptions
            })
        );
    }, []);

    /** Effect to check for cached users */
    useEffect(() => {
        if (web3Modal && web3Modal.cachedProvider) connectWallet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [web3Modal]);

    /** Effect to check for user when provider changes */
    useEffect(() => {
        if (provider) {
            const onAccountsChanged = async (): Promise<void> => {
                const accounts = await provider.listAccounts();

                // Unset the account if no accounts
                if (accounts.length === 0) {
                    setUserAddress(null);
                    return;
                }
                setUserAddress(accounts[0]);
            };

            const onChainChanged = async (): Promise<void> => {
                const network = await provider.getNetwork();
                setChainId(network.chainId);
            };

            provider.addListener('network', onChainChanged);
            window.ethereum && window.ethereum.on('accountsChanged', onAccountsChanged);
            // if (window.ethereum) window.ethereum.on('accountsChanged', onAccountsChanged);

            return () => {
                provider.removeAllListeners();
                window.ethereum.removeAllListeners();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    /** Effect to update the user state and allowed routes whenever user address changes */
    useEffect(() => {
        const fetchUserState = async (): Promise<void> => {
            if (!userAddress || !provider) return;

            setIsLoading(true);

            // CAO token balance
            const caoTokenContract = contracts.caoToken.connect(provider);
            const caoTokenBalance: BigNumber = await caoTokenContract.balanceOf(userAddress);

            const hrContract = contracts.hr.connect(provider);
            // Remuneration per block
            const employeeDetails = await hrContract.getEmployeeByAddress(userAddress);
            const remunerationPerBlock = employeeDetails[0];

            // Remuneration value
            const remunerationValue: BigNumber = (
                await hrContract.getEmployeeCurrentRemuneration(userAddress)
            )[0];

            setUserState({ caoTokenBalance, remunerationPerBlock, remunerationValue });
            setIsLoading(false);
        };

        fetchUserState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAddress]);

    /** Connects the wallet */
    const connectWallet = async (): Promise<void> => {
        if (!web3Modal) return;

        try {
            const instance = await web3Modal.connect();
            const provider = new providers.Web3Provider(instance);
            const userAddress = await provider.getSigner().getAddress();

            setProvider(provider);
            setUserAddress(userAddress);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Web3Context.Provider
            value={{
                isLoading,
                provider,
                chainId,
                userAddress,
                userState,
                allowedRoutes: [
                    // Any type of auth can view homepage
                    ...(!userState.caoTokenBalance.eq(0) ||
                    !userState.remunerationPerBlock.eq(0) ||
                    !userState.remunerationValue.eq(0)
                        ? ['/']
                        : []),
                    // Is governance token holder
                    ...(!userState.caoTokenBalance.eq(0) ? authRoutes.caoTokenHolder : []),
                    // Is employee
                    ...(!userState.remunerationPerBlock.eq(0) || !userState.remunerationValue.eq(0)
                        ? authRoutes.employee
                        : [])
                ],
                connectWallet
            }}>
            {children}
        </Web3Context.Provider>
    );
};
