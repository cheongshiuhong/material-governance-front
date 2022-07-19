// Types
import type { FC, ReactElement } from 'react';
import type { FunctionCall } from '@utils/abis/interfaces';

// Libraries
import { useState, useEffect } from 'react';
import { useField } from 'formik';

// Code
import { combinedCalls } from '@utils/abis';
import Input from '@components/proposals/Input';

/**
 * The arguments inputs component.
 *
 * @returns {ReactElement} - The arguments inputs component.
 */
const Arguments: FC = (): ReactElement => {
    const [_contractField, { value: contractValue }] = useField('contract');
    const [_functionField, { value: functionValue }] = useField('function');
    const [_field, { value }, { setValue }] = useField('arguments');
    const [inputs, setInputs] = useState<FunctionCall['inputs']>([]);

    /** Effect to change the options when contract chosen changes */
    useEffect(() => {
        // Reset to default if no contract chosen
        if (!contractValue.value || !functionValue.value) {
            setInputs([]);
            return;
        }

        const functionCall = combinedCalls[contractValue.value].calls[functionValue.value];
        functionCall && setInputs(functionCall.inputs);
        setValue([]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractValue.value, functionValue.value]);

    return (
        <>
            {inputs.map((input, index) => (
                <div key={index} className={`${index > 0 && 'mt-2'}`}>
                    <Input
                        input={input}
                        value={value[index] || ''}
                        setValue={(newValue) => {
                            const valueCopy = [...value];
                            valueCopy[index] = newValue;
                            setValue(valueCopy);
                        }}
                    />
                </div>
            ))}
        </>
    );
};

export default Arguments;
