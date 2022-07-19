// Types
import type { ReactElement } from 'react';
import type { BigNumber } from '@ethersproject/bignumber';

const BIG_NUMBER_TYPES = new Set(['uint256', 'uint128', 'int256', 'int128']);

type ArgumentProps = {
    type: string;
    value: unknown;
};

/**
 * Formats a decoded argument into its rendered format.
 *
 * @param {ArgumentProps} props - The argument type and value.
 * @returns {ReactElement} - The rendered format of the argument.
 */
const Argument = ({ type, value }: ArgumentProps): ReactElement => {
    // BigNumberish types
    if (BIG_NUMBER_TYPES.has(type)) return <>{(value as BigNumber).toString()}</>;

    // Array types
    if (type.slice(type.length - 2, type.length) === '[]') {
        return (
            <div className="mb-1">
                {(value as unknown[]).map((each, index) => (
                    <p key={index}>
                        <Argument type={type.slice(0, type.length - 2)} value={each} />
                    </p>
                ))}
            </div>
        );
    }

    // Raw data
    if (type === 'bytes' && (value as string).length >= 50)
        return <>{(value as string).slice(0, 48)}&hellip;</>;

    // Default string-based types
    return <>{value as string}</>;
};

export default Argument;
