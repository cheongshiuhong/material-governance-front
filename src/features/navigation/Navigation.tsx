// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { GiBlackBook } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import useRouter from '@hooks/useRouter';

/**
 * The navigation component to show where the user is allowed to go.
 *
 * @returns {ReactElement} - The navigation component.
 */
const Navigation: FC = (): ReactElement => {
    const { allowedRoutes } = useWeb3Context();
    const { redirect } = useRouter();

    return (
        <div className="w-screen">
            <div className="w-full mx-auto mt-6">
                <p className="text-center text-lg lg:text-xl font-bold">Material Governance</p>
            </div>
            <div className="w-full mx-auto mt-10 flex items-center justify-center space-x-8">
                {allowedRoutes.includes('/proposals') && (
                    <button
                        onClick={() => redirect('/proposals')}
                        className="w-40 px-4 py-4 flex flex-col items-center justify-between space-y-2
                        bg-white rounded-md shadow-md">
                        <GiBlackBook size={30} />
                        <span className="text-base lg:text-lg font-semibold">Proposals</span>
                    </button>
                )}
                {allowedRoutes.includes('/remunerations') && (
                    <button
                        onClick={() => redirect('/remunerations')}
                        className="w-40 px-4 py-4 flex flex-col items-center justify-between space-y-2
                        bg-white rounded-md shadow-md">
                        <GrMoney size={30} />
                        <span className="text-base lg:text-lg font-semibold">Remunerations</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navigation;
