// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import Select from 'react-select';
import { useField } from 'formik';

// Code
import selectStyles from '@components/config/selectStyles';
import { combinedCalls } from '@utils/abis';

/**
 * The contract selector component.
 *
 * @returns {ReactElement} - The contract selector component.
 */
const ContractSelector: FC = (): ReactElement => {
    const [contractField, { value: contractValue }, { setValue: setContractValue }] =
        useField('contract');
    const options = Object.entries(combinedCalls).map(([addressOrName, { name }]) => ({
        label: name,
        value: addressOrName
    }));

    return (
        <>
            <div>
                <label htmlFor="contract-selector" className="font-semibold">
                    Contract
                </label>
                <Select
                    id="contract-selector"
                    aria-label="contract-selector"
                    placeholder="Contract"
                    name={contractField.name}
                    options={options}
                    value={contractValue}
                    onChange={(value: EnumType<string>) => setContractValue(value)}
                    styles={selectStyles}
                    closeMenuOnSelect
                    isClearable={false}
                />
            </div>
        </>
    );
};

export default ContractSelector;
