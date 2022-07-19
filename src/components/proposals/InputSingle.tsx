// Types
import type { FC, ReactElement } from 'react';
import type { FunctionInput } from '@utils/abis/interfaces';

type InputSingleProps = {
    input: FunctionInput;
    value: string;
    setValue: (value: string) => void;
};

/**
 * The input component to render the input ui for a function input.
 *
 * @param {InputSingleProps} props - The input details, values and change handler.
 * @returns {ReactElement} - The input component.
 */
const InputSingle: FC<InputSingleProps> = ({
    input,
    value,
    setValue
}: InputSingleProps): ReactElement => {
    return (
        <>
            <label htmlFor={input.name} className="h-8 flex items-center text-sm lg:text-base">
                {input.name} ({input.type})
            </label>
            <input
                id={input.name}
                aria-label={input.name}
                placeholder={`${input.name} (${input.type})`}
                type="text"
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
            />
        </>
    );
};

export default InputSingle;
