// Types
import type { WrapperProps, Nullable } from '@interfaces/general';
import type { Web3Provider, WebSocketProvider } from '@ethersproject/providers';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useEffect } from 'react';
import { providers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import Web3Modal from 'web3modal';

// Code
import uris from '@constants/uris';
import contracts from '@constants/contracts';
import authRoutes from './authRoutes';
import providerOptions from './providerOptions';

interface IWeb3Context {
    isLoading: boolean;
    readProvider: WebSocketProvider;
    writeProvider: Web3Provider | null;
    chainId: number;
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
const DEFAULT_CHAIN_ID = -1;
const DEFAULT_USER_STATE = {
    caoTokenBalance: BigNumber.from(0),
    remunerationPerBlock: BigNumber.from(0),
    remunerationValue: BigNumber.from(0)
};
const Web3Context = createContext<IWeb3Context>({
    isLoading: false,
    readProvider: new providers.WebSocketProvider(uris.bscWssUri),
    writeProvider: null,
    chainId: DEFAULT_CHAIN_ID,
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
    const [readProvider, _setReadProvider] = useState<IWeb3Context['readProvider']>(
        new providers.WebSocketProvider(uris.bscWssUri)
    );
    const [web3Modal, setWeb3Modal] = useState<Nullable<Web3Modal>>(null);
    const [writeProvider, setWriteProvider] = useState<IWeb3Context['writeProvider']>(null);
    const [chainId, setChainId] = useState<IWeb3Context['chainId']>(DEFAULT_CHAIN_ID);
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
        if (writeProvider) {
            const onAccountsChanged = async (): Promise<void> => {
                const accounts = await writeProvider.listAccounts();

                // Unset the account if no accounts
                if (accounts.length === 0) {
                    setUserAddress(null);
                    return;
                }
                setUserAddress(accounts[0]);
            };

            const onChainChanged = async (): Promise<void> => {
                const { chainId } = await writeProvider.getNetwork();
                setChainId(chainId);
            };

            window.ethereum && window.ethereum.on('accountsChanged', onAccountsChanged);
            writeProvider.addListener('network', onChainChanged);

            return () => {
                window.ethereum.removeAllListeners();
                writeProvider.removeAllListeners();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [writeProvider]);

    /** Effect to update the user state and allowed routes whenever user address changes */
    useEffect(() => {
        const fetchUserState = async (): Promise<void> => {
            if (!userAddress || !writeProvider) return;

            setIsLoading(true);

            // Just reload chain if still not loaded (workaround for glitchy behaviour)
            if (chainId === -1) {
                const { chainId } = await writeProvider.getNetwork();
                setChainId(chainId);
            }

            try {
                // CAO token balance
                const caoTokenContract = contracts.caoToken.connect(readProvider);
                const caoTokenBalance: BigNumber = await caoTokenContract.balanceOf(userAddress);

                // Remuneration per block & remuneration value
                const hrContract = contracts.hr.connect(readProvider);
                const employeeDetails = await hrContract.getEmployeeByAddress(userAddress);
                const remunerationPerBlock = employeeDetails[0];
                const remunerationValue: BigNumber = (
                    await hrContract.getEmployeeCurrentRemuneration(userAddress)
                )[0];

                setUserState({ caoTokenBalance, remunerationPerBlock, remunerationValue });
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
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

            setWriteProvider(provider);
            setUserAddress(userAddress);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Web3Context.Provider
            value={{
                isLoading,
                readProvider,
                writeProvider,
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
