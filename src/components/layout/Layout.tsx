// Types
import type { FC, ReactElement } from 'react';
import type { WrapperProps } from '@interfaces/general';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import useRouter from '@hooks/useRouter';

/**
 * The layout wrapper component.
 *
 * @param {WrapperProps} props - The children to wrap.
 * @returns {ReactElement} - The wrapped children with layout.
 */
const Layout: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const { redirect } = useRouter();
    const { connectWallet, userAddress } = useWeb3Context();

    return (
        <div className="max-h-screen max-w-screen overflow-x-hidden overflow-y-auto">
            {/* Header */}
            <div
                className="fixed top-0 h-16 w-screen flex items-center justify-between
                px-6 sm:px-10 md:px-20 z-20 shadow-md
                bg-translucent-light-gray">
                {/* Title */}
                <div className="w-1/2 flex items-center justify-start">
                    <button
                        onClick={() => redirect('/')}
                        className="px-4 py-2 text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-translucent-dark-gray">
                        Material Governance
                    </button>
                </div>
                {/* Wallet */}
                <div className="w-1/2 flex items-center justify-end">
                    {userAddress ? (
                        <button
                            disabled
                            className="px-2.5 py-1.5 text-xs md:text-sm lg:text-base bg-translucent-dark-gray text-white rounded-md shadow-lg">
                            {userAddress.slice(0, 10)}&hellip;
                        </button>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="px-2.5 py-1.5 text-xs md:text-sm lg:text-base bg-translucent-dark-gray text-white rounded-md shadow-lg">
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
            {/* Body */}
            <div className="w-screen flex items-center justify-between pt-24 mx-auto mb-16 px-6 sm:px-10 md:px-20">
                {userAddress ? children : <></>}
            </div>
        </div>
    );
};

export default Layout;
