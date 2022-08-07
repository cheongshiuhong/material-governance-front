// Types
import type { FC, ReactElement, ChangeEvent } from 'react';
import type { FunctionInput } from '@utils/abis/interfaces';

// Libraries
import { AiOutlineClose } from 'react-icons/ai';
import { GrAdd } from 'react-icons/gr';

type InputArrayProps = {
    input: FunctionInput;
    values: string[];
    setValues: (values: string[]) => void;
};

/**
 * The input array component to render the inputs ui for a function's array input.
 *
 * @param {InputArrayProps} props - The input details, values and change handler.
 * @returns {ReactElement} - The input component.
 */
const InputArray: FC<InputArrayProps> = ({
    input,
    values,
    setValues
}: InputArrayProps): ReactElement => {
    /**
     * Handles change by updating and setting the parent values.
     *
     * @param {number} index - The index of the element to change.
     * @param {ChangeEvent<HTMLInputElement>} e - The change event.
     */
    const onChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const valuesCopy = [...values];
        valuesCopy[index] = e.target.value;
        setValues(valuesCopy);
    };

    /** Adds an element by extending the array */
    const addElement = () => {
        const valuesCopy = [...values];
        valuesCopy.push('');
        setValues(valuesCopy);
    };

    /**
     * Removes an element from the array.
     *
     * @param {number} index - The index of the element to remove.
     */
    const removeElement = (index: number) => {
        const valuesCopy = [...values];
        valuesCopy.splice(index, 1);
        setValues(valuesCopy);
    };

    return (
        <>
            <div className="h-8 flex items-center justify-between">
                <label htmlFor={input.name} className="text-sm lg:text-base">
                    {input.name} ({input.type})
                </label>
                <button
                    type="button"
                    onClick={addElement}
                    className="px-3 flex items-center justify-center bg-translucent-light-gray rounded-xl">
                    <GrAdd />
                    &nbsp;Add
                </button>
            </div>
            {values.map((value, index) => (
                <div
                    key={index}
                    className={`
                        relative h-10 w-full border-1 rounded-lg appearance-none border
                        ${index > 0 && 'mt-2'}`}>
                    <input
                        id={input.name}
                        aria-label={input.name}
                        placeholder={`${input.name} (${input.type})`}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(index, e)}
                        className="h-10 w-full px-3 border-1 appearance-none border focus:outline-none data-hj-allow"
                    />
                    {values.length > 1 && (
                        <button
                            onClick={() => removeElement(index)}
                            className="absolute right-1 h-10 w-10 px-0.5 py-0.5 rounded-full">
                            <AiOutlineClose />
                        </button>
                    )}
                </div>
            ))}
        </>
    );
};

export default InputArray;
