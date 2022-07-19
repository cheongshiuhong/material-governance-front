// Types
import type { FC, ReactElement } from 'react';
import type { WrapperProps } from '@interfaces/general';

// Libraries
import Error from 'next/error';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import useRouter from '@hooks/useRouter';
import Spinner from '@components/ui/Spinner';

/**
 * The auth wrapper component.
 *
 * @param {WrapperProps} props - The children to wrap.
 * @returns {ReactElement} - The wrapped children with auth.
 */
const Auth: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const { isLoading, connectWallet, userAddress, allowedRoutes } = useWeb3Context();
    const { currentPath } = useRouter();

    // Show spinner when loading to avoid jitterness
    if (isLoading)
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Spinner />
            </div>
        );

    // Prompt to connect wallet if no user yet
    if (!userAddress)
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div
                    className="flex flex-col items-center justify-center
                    px-6 py-6 space-y-4
                    bg-translucent-dark-gray text-white
                    rounded-lg shadow-md">
                    <p className="text-sm md:text-base lg:text-lg">
                        Please connect wallet to proceed.
                    </p>
                    <button
                        onClick={connectWallet}
                        className="px-2 py-2
                        bg-translucent-light-gray hover:bg-white-smoke
                        text-translucent-dark-gray
                        text-sm md:text-base
                        rounded-md shadow-md hover:shadow-lg">
                        Connect Wallet
                    </button>
                </div>
            </div>
        );

    // Forbidden if route not allowed
    if (!allowedRoutes.includes(currentPath)) return <Error statusCode={403} title="Forbidden" />;

    return <>{children}</>;
};

export default Auth;
