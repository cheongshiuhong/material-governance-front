// Types
import type { FC, ReactElement, MouseEvent } from 'react';
import type { Nullable } from '@interfaces/general';
import type { EncodedFunctionCall } from '@utils/abis/interfaces';

// Libraries
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { IoMdAddCircleOutline } from 'react-icons/io';

// Code
import { useWeb3Context } from '@contexts/web3';
import contracts from '@constants/contracts';
import useRouter from '@hooks/useRouter';
import useFunds from './hooks/useFunds';
import CreateProposalCall from './CreateProposalCall';

const MAX_BLOCKS_DELAY = 3 * 28800;
const MIN_BLOCKS_DURATION = 1200;

/**
 * The create proposal component.
 *
 * @returns {ReactElement} - The component to create a proposal.
 */
const CreateProposal: FC = (): ReactElement => {
    const { writeProvider } = useWeb3Context();
    const { redirect } = useRouter();
    const { addressesOptions } = useFunds();
    const [description, setDescription] = useState<string>('');
    const [blocksDelay, setBlocksDelay] = useState<number>(0);
    const [blocksDuration, setBlocksDuration] = useState<number>(MIN_BLOCKS_DURATION);
    const [encodedCalls, setEncodedCalls] = useState<Nullable<EncodedFunctionCall>[]>([null]);
    const [error, setError] = useState<string>('');

    /** Adds a call by extending the array. */
    const addCall = () => {
        setEncodedCalls([...encodedCalls, null]);
    };

    /**
     * Removes a call from the array.
     *
     * @param {number} index - The index of the call to remove.
     */
    const removeCall = (index: number) => {
        const encodedCallsCopy = [...encodedCalls];
        encodedCallsCopy.splice(index, 1);
        setEncodedCalls(encodedCallsCopy);
    };

    /**
     * Sets the encoded function call.
     *
     * @param {EncodedFunctionCall} encodedCall - The encoded call info.
     * @param {number} index - The index to set at.
     */
    const setEncodedCall = (encodedCall: EncodedFunctionCall, index: number) => {
        const encodedCallsCopy = [...encodedCalls];
        encodedCallsCopy[index] = encodedCall;
        setEncodedCalls(encodedCallsCopy);
    };

    /**
     * Submits the creation of the proposal to the chain.
     *
     * @param {MouseEvent<HTMLButtonElement>} e - The click event.
     */
    const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError('');

        // Check that all are filled in
        const nullIndexes: number[] = [];
        encodedCalls.forEach((encodedCall, index) => {
            if (encodedCall === null) nullIndexes.push(index);
        });
        if (nullIndexes.length === 1) {
            setError(`Error: Proposal Function Call #${nullIndexes[0]} is incomplete/invalid.`);
            return;
        }
        if (nullIndexes.length > 1) {
            setError(
                `Error: Proposal Function Calls #${nullIndexes.join(', #')} are incomplete/invalid.`
            );
            return;
        }

        // Check for provider
        if (!writeProvider) {
            setError('Error: Provider not initialized');
            return;
        }

        try {
            await contracts.cao.connect(writeProvider.getSigner()).functions.createProposal(
                description,
                blocksDelay,
                blocksDuration,
                encodedCalls.map(
                    (encodedCall) => (encodedCall as EncodedFunctionCall).contractAddress
                ),
                encodedCalls.map(
                    (encodedCall) => (encodedCall as EncodedFunctionCall).encodedCallData
                ),
                encodedCalls.map((encodedCall) => (encodedCall as EncodedFunctionCall).value)
            );
            redirect(`/proposals`);
        } catch (err) {
            if (err.code === 4001) return;
            setError(`Error: unexpected error. ${err.data?.message || err.message}`);
        }
    };

    // Return blank if adresses options not fetched yet
    if (!addressesOptions) return <></>;

    return (
        <div className="w-full max-w-[980px] mx-auto space-y-6">
            {/* Proposal general details */}
            <div className="w-full max-auto px-10 py-6 bg-white rounded-md shadow-md space-y-4">
                <p className="text-base lg:text-lg">
                    <span className="font-semibold">Create Proposal</span>
                </p>
                <div>
                    <label htmlFor="description" className="font-semibold text-sm lg:text-base">
                        Description
                    </label>
                    <input
                        id="description"
                        aria-label="description"
                        placeholder="This is a proposal to ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                    />
                </div>
                <div>
                    <label htmlFor="blocks-delay" className="font-semibold text-sm lg:text-base">
                        Blocks Delay (max {MAX_BLOCKS_DELAY} blocks)
                    </label>
                    <input
                        id="blocks-delay"
                        aria-label="blocks-delay"
                        type="number"
                        min={0}
                        max={MAX_BLOCKS_DELAY}
                        value={blocksDelay}
                        onChange={(e) => setBlocksDelay(Number(e.target.value))}
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                    />
                </div>
                <div>
                    <label htmlFor="blocks-duration" className="font-semibold text-sm lg:text-base">
                        Blocks Duration (min {MIN_BLOCKS_DURATION} blocks)
                    </label>
                    <input
                        id="blocks-duration"
                        aria-label="blocks-duration"
                        type="number"
                        min={MIN_BLOCKS_DURATION}
                        value={blocksDuration}
                        onChange={(e) => setBlocksDuration(Number(e.target.value))}
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                    />
                </div>
            </div>

            {/* Proposal function calls */}
            <div className="w-full mx-auto px-10 py-6 bg-white rounded-md shadow-md">
                {encodedCalls.map((encodedCall, index) => (
                    <div key={index}>
                        <div className="h-10 w-full mb-2 flex items-center justify-between">
                            <p className="text-base lg:text-lg font-semibold">
                                Proposal Function Call #{index + 1}
                            </p>
                            {encodedCalls.length > 1 && (
                                <button
                                    onClick={() => removeCall(index)}
                                    className="px-1 py-0.5 lg:px-2 lg:py-1 flex items-center justify-center
                                    text-sm lg:text-base
                                    border-2 border-red-500 text-red-500 rounded-md">
                                    <AiOutlineClose />
                                    &nbsp;Remove
                                </button>
                            )}
                        </div>
                        <CreateProposalCall
                            addressesOptions={addressesOptions}
                            encodedCall={encodedCall}
                            setEncodedCall={(encodedCall: EncodedFunctionCall) =>
                                setEncodedCall(encodedCall, index)
                            }
                        />
                        <hr className="my-6 border-gray-300" />
                    </div>
                ))}
                <button
                    onClick={addCall}
                    className="w-full py-1 flex items-center justify-center
                    bg-translucent-dark-gray text-white rounded-md">
                    <IoMdAddCircleOutline />
                    &nbsp;Add Function Call
                </button>
            </div>

            {/* Submit button */}
            <div className="w-full mt-4 space-y-4">
                <button
                    onClick={onSubmit}
                    className="w-full py-1 flex items-center justify-center
                    bg-green-600 text-white rounded-md">
                    Submit
                </button>
                <p className="w-full text-center text-red-500 italic">{error}</p>
            </div>
        </div>
    );
};

export default CreateProposal;
