// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';

type ExecutionProps = {
    execute: () => Promise<void>;
};

/**
 * The execution component.
 *
 * @param {ExecutionProps} props - The execute function.
 * @returns {ReactElement} - The execution component.
 */
const Execution: FC<ExecutionProps> = ({ execute }: ExecutionProps): ReactElement => {
    const [error, setError] = useState<string>('');

    const submitExecute = async (): Promise<void> => {
        try {
            await execute();
        } catch (err) {
            if (err.code === 4001) return;
            setError(`Error: unexpected error. ${err.data?.message || err.message}`);
        }
    };

    return (
        <div className="w-full px-3 py-3 overflow-x-auto bg-white shadow-md">
            <div className="w-full flex items-center justify-between">
                <p className="text-base lg:text-lg font-semibold">Proposal Execution</p>
                <button
                    onClick={submitExecute}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md">
                    Execute
                </button>
            </div>
            <p className="text-red-500 italic">{error}</p>
        </div>
    );
};

export default Execution;
