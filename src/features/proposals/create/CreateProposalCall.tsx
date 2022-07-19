// Types
import type { FC, ReactElement } from 'react';
import type { Nullable } from '@interfaces/general';
import type { EncodedFunctionCall } from '@utils/abis/interfaces';
import type { InputValues, AddressesOptions } from './interfaces';

// Libraries
import { useState } from 'react';
import { Formik, Form } from 'formik';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { AiOutlineSave, AiOutlineEdit } from 'react-icons/ai';

// Code
import { combinedCalls } from '@utils/abis';
import ContractSelector from './inputs/ContractSelector';
import AddressSelectorInput from './inputs/AddressSelectorInput';
import FunctionSelector from './inputs/FunctionSelector';
import Arguments from './inputs/Arguments';
import ValueInput from './inputs/ValueInput';

type CreateProposalCallProps = {
    addressesOptions: AddressesOptions;
    encodedCall: Nullable<EncodedFunctionCall>;
    setEncodedCall: (call: EncodedFunctionCall) => void;
};

/**
 * The create proposal edit component.
 *
 * @param {CreateProposalCallProps} props - The state reader and setter.
 * @returns {ReactElement} - The component to edit a proposal's call.
 */
const CreateProposalCall: FC<CreateProposalCallProps> = ({
    addressesOptions,
    encodedCall,
    setEncodedCall
}: CreateProposalCallProps): ReactElement => {
    const [error, setError] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(true);

    /**
     * Validates inputs and encodes the function call before setting the parent state.
     *
     * @param {InputValues} values - The input values to validate and encode.
     */
    const onSubmit = (values: InputValues) => {
        const matchedCall = combinedCalls[values.contract.value]?.calls[values.function.value];

        // Error if not matched
        if (!matchedCall) {
            setError('Error: No function calls matched.');
            return;
        }

        // Check address is present and valid if generic
        const contractAddress =
            values.contract.value.slice(0, 2) === '0x'
                ? values.contract.value
                : values.contractAddress?.value;

        if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
            setError('Error: Contract address is invalid.');
            return;
        }

        // Encode call data
        let encodedCallData: string;
        try {
            encodedCallData = matchedCall.encodeCallData(values.arguments);
        } catch (err) {
            setError('Error: Failed to encode call data, please check inputs.');
            return;
        }

        setEncodedCall({ contractAddress, encodedCallData, value: 0 });
        setError('');
        setIsEditing(false);
    };

    return (
        <Formik
            initialValues={{
                contract: { label: '', value: '' },
                contractAddress: { label: '', value: '' },
                function: { label: '', value: '' },
                arguments: [],
                value: BigNumber.from(0)
            }}
            enableReinitialize
            onSubmit={onSubmit}
            className="w-full mx-auto">
            {({ values }) => (
                <>
                    <div className={`${!isEditing && 'hidden'}`}>
                        <Form>
                            <div className="space-y-2">
                                <ContractSelector />
                                <AddressSelectorInput addressesOptions={addressesOptions} />
                                <FunctionSelector />
                                <Arguments />
                                <ValueInput />
                            </div>
                            <div className="w-full mt-4 flex items-center justify-between">
                                <p className="text-red-500 italic">{error}</p>
                                <button
                                    type="submit"
                                    className="w-1/3 lg:w-1/6 px-2 py-1 flex items-center justify-center
                                    bg-translucent-dark-gray text-white rounded-md">
                                    <AiOutlineSave />
                                    &nbsp;Save
                                </button>
                            </div>
                        </Form>
                    </div>
                    <div className={`${isEditing && 'hidden'}`}>
                        <div>
                            <p>
                                <span className="font-semibold text-sm lg:text-base">Contract</span>
                                :&nbsp;
                                {values.contract.label}
                            </p>
                            <p>
                                <span className="font-semibold text-sm lg:text-base">Address</span>
                                :&nbsp;
                                {encodedCall?.contractAddress}
                            </p>
                            <p>
                                <span className="font-semibold text-sm lg:text-base">Function</span>
                                :&nbsp;
                                {values.function.label}
                            </p>
                            <p className="font-semibold text-sm lg:text-base">Call Data:</p>
                            <p className="break-all text-sm lg:text-base">
                                {encodedCall?.encodedCallData}
                            </p>
                            <p>
                                <span className="font-semibold text-sm lg:text-base">Value</span>
                                :&nbsp;
                                <span className="text-sm lg:text-base">{encodedCall?.value}</span>
                            </p>
                            <div className="w-full mt-4 flex items-center justify-end">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-1/3 lg:w-1/6 px-2 py-1 flex items-center justify-center
                                    bg-translucent-dark-gray text-white rounded-md">
                                    <AiOutlineEdit />
                                    &nbsp;Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Formik>
    );
};

export default CreateProposalCall;
