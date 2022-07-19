// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';
import { AddressesOptions } from '../interfaces';

// Libraries
import { useEffect } from 'react';
import Select from 'react-select';
import { useField } from 'formik';

// Code
import selectStyles from '@components/config/selectStyles';

type AddressSelectorInputProps = {
    addressesOptions: AddressesOptions;
};

/**
 * The address selector or input component.
 *
 * @param {AddressSelectorInputProps} addressesOptions - The addresses options conditional on the
 *   contract selected.
 * @returns {ReactElement} - The address selector or input component.
 */
const AddressSelectorInput: FC<AddressSelectorInputProps> = ({
    addressesOptions
}: AddressSelectorInputProps): ReactElement => {
    const [_contractField, { value: contractValue }] = useField('contract');
    const [addressField, { value: addressValue }, { setValue: setAddressValue }] =
        useField('contractAddress');
    const options = addressesOptions[contractValue.value];

    /** Effect to change the default selected value when contract chosen changes */
    useEffect(() => {
        // Reset to default if no contract chosen
        setAddressValue(options?.length ? options[0] : { label: '', value: '' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractValue.value]);

    return (
        <>
            {/* {addressValue} */}
            {/* Require address only for generic contracts */}
            {contractValue.value.slice(0, 2) !== '0x' && (
                <div>
                    {options?.length ? (
                        // Selector for fund contracts
                        <>
                            <label htmlFor="address" className="font-semibold">
                                Fund
                            </label>
                            <Select
                                id="address-selector"
                                aria-label="address-selector"
                                placeholder="Fund"
                                name={addressField.name}
                                options={options}
                                value={addressValue}
                                onChange={(value: EnumType<string>) => setAddressValue(value)}
                                styles={selectStyles}
                                closeMenuOnSelect
                                isClearable={false}
                            />
                        </>
                    ) : (
                        // Manual input for non-fund contracts
                        <>
                            <label htmlFor="address" className="font-semibold">
                                Address
                            </label>
                            <input
                                id="address"
                                aria-label="address"
                                placeholder="0x..."
                                value={addressValue.value}
                                onChange={(e) =>
                                    setAddressValue({ label: '', value: e.target.value })
                                }
                                type="text"
                                className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                            />
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default AddressSelectorInput;
