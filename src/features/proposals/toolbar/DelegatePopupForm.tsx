// Types
import type { FC, ReactElement } from 'react';
import type { Nullable } from '@interfaces/general';

// Libraries
import { useState } from 'react';
import { ethers } from 'ethers';
import { Popup } from 'reactjs-popup';

// Contexts
import { useWeb3Context } from '@contexts/web3';

type DelegatePopupFormProps = {
    isOpen: boolean;
    close: () => void;
    delegatee: Nullable<string>;
    delegate: (newDelegatee: string) => Promise<void>;
};

/**
 * The delegate popup form component.
 *
 * @param {DelegatePopupFormProps} props - The popup state and form values.
 * @returns {ReactElement} - The delegate popup form component.
 */
const DelegatePopupForm: FC<DelegatePopupFormProps> = ({
    isOpen,
    close,
    delegatee,
    delegate
}: DelegatePopupFormProps): ReactElement => {
    const { userAddress } = useWeb3Context();
    const isDelegated = delegatee !== ethers.constants.AddressZero;

    const [formDelegateeAddress, setFormDelegateeAddress] = useState<string>(
        delegatee && isDelegated ? delegatee : ''
    );
    const [error, setError] = useState<string>('');

    const onSubmit = async (): Promise<void> => {
        setError('');

        // Check address is valid
        if (!ethers.utils.isAddress(formDelegateeAddress)) {
            setError('Error: input address is invalid.');
            return;
        }

        if (formDelegateeAddress === delegatee) {
            setError('Error: input is same as current delegatee, avoid wasting gas.');
            return;
        }

        // Make the call
        try {
            await delegate(formDelegateeAddress);
            close();
        } catch (err) {
            // User cancelled
            if (err.code === 4001) return;
            setError(`Error: unexpected error. ${err.data?.message || err.message}`);
        }
    };

    return (
        <Popup
            open={isOpen}
            closeOnDocumentClick
            onClose={close}
            overlayStyle={{
                position: 'absolute',
                top: '0',
                backgroundColor: 'rgba(0,0,0,0.8)'
            }}
            contentStyle={{
                zIndex: '50',
                margin: 'auto',
                width: '50%',
                maxWidth: '560px',
                minWidth: '360px'
            }}>
            <div
                className="h-full w-full px-6 py-6
                flex flex-col items-center justify-evenly
                bg-white rounded-md shadow-lg">
                <p className="font-semibold text-base lg:text-lg">
                    {!isDelegated
                        ? 'You have not delegated your voting power:'
                        : 'Change who you delegated your voting power to:'}
                </p>
                <div className="w-ful mt-6 flex items-center justify-center space-x-4">
                    {isDelegated && (
                        <button
                            onClick={() => setFormDelegateeAddress(ethers.constants.AddressZero)}
                            className="px-2 py-1 border-2 border-yellow-600 text-yellow-600 rounded-md">
                            Undelegate
                        </button>
                    )}
                    <button
                        onClick={() => setFormDelegateeAddress(userAddress || '')}
                        className="px-2 py-1 bg-green-600 text-white rounded-md">
                        Delegate to myself
                    </button>
                </div>
                <div className="w-full mt-6">
                    <label htmlFor="delegatee-address" className="text-sm font-semibold">
                        Manual input
                    </label>
                    <input
                        id="delegatee-address"
                        aria-label="delegatee-address"
                        type="text"
                        value={formDelegateeAddress}
                        onChange={(e) => setFormDelegateeAddress(e.target.value)}
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                    />
                    <p className="text-red-500 italic text-sm">{error}</p>
                    <div className="mt-6 flex items-center justify-center">
                        <button
                            onClick={onSubmit}
                            className="px-3 py-1.5 bg-translucent-dark-gray text-white rounded-md">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default DelegatePopupForm;
