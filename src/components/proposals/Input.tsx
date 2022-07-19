// Types
import type { FC, ReactElement } from 'react';
import type { FunctionInput } from '@utils/abis/interfaces';

// Code
import InputSingle from './InputSingle';
import InputArray from './InputArray';

type InputProps = {
    input: FunctionInput;
    value: string | string[];
    setValue: (value: string | string[]) => void;
};

/**
 * The input component to render the input ui for a function input.
 *
 * @param {InputProps} props - The input details, values and change handler.
 * @returns {ReactElement} - The input component.
 */
const Input: FC<InputProps> = ({ input, value, setValue }: InputProps): ReactElement => {
    // Array type -- currently only support single type as array child (tuples wont work)
    if (input.arrayChildren)
        return (
            <InputArray
                input={input}
                values={Array.isArray(value) ? value : ['']}
                setValues={setValue}
            />
        );

    // Tuple types
    if (input.type === 'tuple' && input.components)
        return (
            <>
                {input.components.map((component, index) => (
                    <Input
                        key={index}
                        input={component}
                        value={Array.isArray(value) ? value[index] : ''}
                        setValue={(newValue) => {
                            const valueCopy = Array.isArray(value) ? [...value] : [];
                            valueCopy[index] = newValue as string;
                            setValue(valueCopy);
                        }}
                    />
                ))}
            </>
        );

    // Default is single input type
    return <InputSingle input={input} value={value as string} setValue={setValue} />;
};

export default Input;
