// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useField } from 'formik';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * The input component for ethers value.
 *
 * @returns {ReactElement} - The value input component.
 */
const ValueInput: FC = (): ReactElement => {
    const [field, { value }, { setValue }] = useField('value');

    return (
        <div>
            <label htmlFor="value" className="font-semibold">
                Value (weis)
            </label>
            <input
                id={field.name}
                aria-label={field.name}
                type="number"
                min={0}
                value={value.toString()}
                onChange={(e) => setValue(BigNumber.from(e.target.value))}
                className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
            />
        </div>
    );
};

export default ValueInput;
