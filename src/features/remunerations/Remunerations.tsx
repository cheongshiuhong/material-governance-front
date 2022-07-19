// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useState } from 'react';
import Select from 'react-select';

// Code
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import selectStyles from '@components/config/selectStyles';
import useRemuneration from './hooks/useRemuneration';

/**
 * The remunerations component.
 *
 * @returns {ReactElement} - The remunerations component.
 */
const Remunerations: FC = (): ReactElement => {
    const { details, tokensClaimable, claim } = useRemuneration();
    const [tokenToClaimIndex, setTokenToClaimIndex] = useState<number>(0);
    const options = tokensClaimable.map(({ name, symbol }, index) => ({
        label: `${name} (${symbol})`,
        value: index
    }));

    return (
        <div className="w-full max-w-[520px] mx-auto space-y-8">
            <div
                className="h-full w-full px-4 py-3
                space-y-4 bg-white rounded-md shadow-md">
                <div className="space-y-2">
                    <p className="font-semibold py-1">My Remuneration</p>
                    <p className="text-sm">
                        <span className="font-semibold">Remuneration Per Block</span>:&nbsp;
                        {details && (
                            <>
                                $&nbsp;
                                {bigNumberToDecimalString(details.remunerationPerBlock, 18, 18)}
                            </>
                        )}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Remuneration Accrued</span>:&nbsp;
                        {details && (
                            <>
                                $&nbsp;
                                {bigNumberToDecimalString(details.currentRemuneration, 18, 18)}
                            </>
                        )}
                    </p>
                </div>
                <hr className="border-translucent-light-gray" />
                <div className="space-y-4">
                    <p className="font-semibold">Redeem Remuneration</p>
                    <Select
                        id="token-to-claim-selector"
                        aria-label="token-to-claim-selector"
                        placeholder="Token"
                        name="token-to-claim-selector"
                        options={options}
                        value={options[tokenToClaimIndex] || { label: '', value: -1 }}
                        onChange={(value) =>
                            setTokenToClaimIndex((value as EnumType<number>).value)
                        }
                        styles={selectStyles}
                        closeMenuOnSelect
                        isClearable={false}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm">
                            <span className="font-semibold">Redeemable Amount</span>:&nbsp;
                            {tokensClaimable[tokenToClaimIndex] && (
                                <>
                                    &nbsp;
                                    {bigNumberToDecimalString(
                                        tokensClaimable[tokenToClaimIndex].redeemAmount,
                                        18,
                                        18
                                    )}
                                </>
                            )}
                        </p>
                        <button
                            disabled={
                                !tokensClaimable[tokenToClaimIndex] ||
                                (tokensClaimable[tokenToClaimIndex] &&
                                    tokensClaimable[tokenToClaimIndex].redeemAmount.eq(0))
                            }
                            onClick={() =>
                                tokensClaimable[tokenToClaimIndex] &&
                                claim(tokensClaimable[tokenToClaimIndex].address)
                            }
                            className={`
                                px-2 py-1 bg-green-600 text-white rounded-md
                                ${
                                    (!tokensClaimable[tokenToClaimIndex] ||
                                        (tokensClaimable[tokenToClaimIndex] &&
                                            tokensClaimable[tokenToClaimIndex].redeemAmount.eq(
                                                0
                                            ))) &&
                                    'bg-gray-400 opacity-80'
                                }
                            `}>
                            Redeem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Remunerations;
