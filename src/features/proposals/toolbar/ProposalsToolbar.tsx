// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import useVotingPower from './hooks/useVotingPower';
import useDelegatee from './hooks/useDelegatee';
import DelegatePopupForm from './DelegatePopupForm';

// Icons
import { AiFillEdit } from 'react-icons/ai';
import { FaCoins, FaFistRaised, FaPersonBooth } from 'react-icons/fa';

/**
 * The proposals toolbar component.
 *
 * @returns {ReactElement} - The proposals toolbar component.
 */
const ProposalsToolbar: FC = (): ReactElement => {
    const { userAddress, userState } = useWeb3Context();
    const { votingPower, totalVotingPower } = useVotingPower();
    const { delegatee, delegate } = useDelegatee();
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    /** Initial check to prompt user to delegate if not already delegated */
    useEffect(() => {
        if (delegatee === ethers.constants.AddressZero) {
            setIsPopupOpen(true);
        }
    }, [delegatee]);

    return (
        <>
            <div
                className="w-full max-w-[980px] mx-auto
                grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4
                gap-x-6 gap-y-6">
                <div
                    className="px-4 py-4 flex items-center justify-evenly space-x-4
                    bg-white rounded-md shadow-md">
                    <FaCoins size={42} className="text-yellow-400 my-2" />
                    <div className="flex flex-col items-center space-y-1">
                        <p className="text-sm lg:text-base font-semibold text-center">Balance</p>
                        <p className="text-sm">
                            {bigNumberToDecimalString(userState.caoTokenBalance, 18, 2)}
                        </p>
                    </div>
                </div>
                <div
                    className="px-4 py-4 flex items-center justify-evenly space-x-4
                    bg-white rounded-md shadow-md">
                    <FaFistRaised size={42} className="text-slate-400 my-2" />
                    <div className="flex flex-col items-center space-y-1">
                        <p className="text-sm lg:text-base font-semibold text-center">
                            Voting Power
                        </p>
                        <p className="text-sm">
                            {bigNumberToDecimalString(votingPower, 18, 2)}&nbsp;/&nbsp;
                            {bigNumberToDecimalString(totalVotingPower, 18, 2)}
                        </p>
                    </div>
                </div>
                <div
                    className="col-span-2 px-4 py-4 flex items-center justify-evenly space-x-4
                    bg-white rounded-md shadow-md">
                    <FaPersonBooth size={42} className="text-green-800 my-2" />
                    <div className="flex flex-col items-center space-y-1">
                        <p className="text-sm lg:text-base font-semibold text-center flex items-center space-x-4">
                            <span>Delegated Voter</span>
                            <button
                                onClick={() => setIsPopupOpen(true)}
                                className="px-2 flex items-center space-x-2 bg-translucent-dark-gray text-white rounded-md">
                                <AiFillEdit />
                                <span className="text-sm">Change</span>
                            </button>
                        </p>
                        <p className="text-sm">
                            {delegatee === ethers.constants.AddressZero
                                ? 'Not delegated yet.'
                                : delegatee === userAddress
                                ? 'Delgated to self.'
                                : delegatee}
                        </p>
                    </div>
                </div>
            </div>
            <DelegatePopupForm
                isOpen={isPopupOpen}
                close={() => setIsPopupOpen(false)}
                delegatee={delegatee}
                delegate={delegate}
            />
        </>
    );
};

export default ProposalsToolbar;
