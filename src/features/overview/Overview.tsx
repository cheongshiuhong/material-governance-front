// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useState } from 'react';
import Select from 'react-select';

// Code
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import selectStyles from '@components/config/selectStyles';
import useCAO from './hooks/useCAO';
import useHumanResources from './hooks/useHumanResources';
import useAccounting from './hooks/useAccounting';
import useFrontOffice from './hooks/useFrontOffice';
import useIncentivesManager from './hooks/useIncentivesManager';

/**
 * The overview component.
 *
 * @returns {ReactElement} - The overview component.
 */
const Overview: FC = (): ReactElement => {
    const { reserveTokens, funds } = useCAO();
    const { employees, unredeemedExEmployees } = useHumanResources();

    const [fundIndex, setFundIndex] = useState<number>(0);
    const { accountingFTBalance, managementFee, evaluationPeriodBlocks, fundTokenPrice, state } =
        useAccounting(funds[fundIndex]);
    const { frontOfficeFTBalance, allowedTokens, maxSingleWithdrawalFundTokenAmount } =
        useFrontOffice(funds[fundIndex]);
    const { incentives } = useIncentivesManager(funds[fundIndex]);

    return (
        <div className="w-full max-w-[1080px] mx-auto space-y-8">
            <p className="text-center text-lg lg:text-xl font-bold">Material CAO</p>
            {/* CAO details */}
            <div className="h-auto xl:h-[280px] w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Reserve tokens */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto 
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Reserve Tokens</p>
                    {reserveTokens.map((reserveToken) => (
                        <div key={reserveToken.address} className="py-1 text-sm">
                            <p className="text-sm">
                                <span className="font-semibold">Symbol</span>:&nbsp;
                                {reserveToken.symbol}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Address</span>:&nbsp;
                                {reserveToken.address}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Oracle</span>:&nbsp;
                                {reserveToken.oracle}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">CAO Balance</span>:&nbsp;
                                {bigNumberToDecimalString(reserveToken.caoBalance, 18, 18)}
                            </p>
                        </div>
                    ))}
                </div>
                {/* Employees */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Employees</p>
                    {[...unredeemedExEmployees, ...employees].map((employee, index) => (
                        <div key={employee.address} className="py-1 text-sm">
                            <p className="text-sm">
                                <span className="font-semibold">Address</span>:&nbsp;
                                {employee.address}
                                {index < unredeemedExEmployees.length && (
                                    <>
                                        &nbsp;(
                                        <span className="italic font-semibold">Ex-Employee</span>)
                                    </>
                                )}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Remuneration Per Block</span>:&nbsp;
                                $&nbsp;
                                {bigNumberToDecimalString(employee.remunerationPerBlock, 18, 18)}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Remuneration Accrued</span>
                                :&nbsp;$&nbsp;
                                {bigNumberToDecimalString(employee.currentRemuneration, 18, 18)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Funds details */}
            <p className="text-center text-lg lg:text-xl font-bold">Funds</p>
            <div className="w-1/3 min-w-[320px] mx-auto z-0">
                <Select
                    id="fund-selector"
                    aria-label="fund-selector"
                    placeholder="Fund"
                    name="fund-selector"
                    options={funds.map((fund, index) => ({ label: fund.name, value: index }))}
                    value={{ label: funds[fundIndex]?.name || '', value: fundIndex }}
                    onChange={(value) => value && setFundIndex((value as EnumType<number>).value)}
                    styles={selectStyles}
                    closeMenuOnSelect
                    isClearable={false}
                />
            </div>
            <p className="text-center text-lg">
                <span className="font-semibold">CAO Fund Token Balance</span>:&nbsp;
                {funds[fundIndex] &&
                    bigNumberToDecimalString(funds[fundIndex].caoFTBalance, 18, 18)}
            </p>
            <div className="h-auto xl:h-[680px] w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="h-full w-full px-4 py-3 overflow-y-auto bg-white shadow-md">
                    {/* Parameters */}
                    <p className="font-semibold mb-1 py-1 border-b border-translucent-light-gray">
                        Parameters
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Management Fee (Accounting)</span>:&nbsp;
                        {managementFee && bigNumberToDecimalString(managementFee, 18, 18)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Evaluation Period Blocks (Accounting)</span>
                        :&nbsp;
                        {evaluationPeriodBlocks}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">
                            Max Single Withdrawal Fund Tokens (Front Office)
                        </span>
                        :&nbsp;
                        {maxSingleWithdrawalFundTokenAmount &&
                            bigNumberToDecimalString(maxSingleWithdrawalFundTokenAmount, 18, 18)}
                    </p>
                </div>
                {/* Accounting States */}
                <div className="h-full w-full px-4 py-3 space-y-1 overflow-y-auto bg-white shadow-md">
                    <p className="font-semibold mb-1 py-1 border-b border-translucent-light-gray">
                        Accounting States
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Fund Token Balance</span>
                        &nbsp;
                        {bigNumberToDecimalString(accountingFTBalance, 18, 18)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Fund Token Price</span>:&nbsp;$&nbsp;
                        {fundTokenPrice && bigNumberToDecimalString(fundTokenPrice, 18, 18)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">AUM Value</span>:&nbsp;$&nbsp;
                        {state && bigNumberToDecimalString(state.aumValue, 18, 18)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Period Beginning AUM Value</span>
                        :&nbsp;$&nbsp;
                        {state && bigNumberToDecimalString(state.periodBeginningAum, 18, 18)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Period Beginning Block</span>:&nbsp;
                        {state && state.periodBeginningBlock.toString()}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Period Beginning Supply</span>:&nbsp;
                        {state && bigNumberToDecimalString(state.periodBeginningSupply, 18, 18)}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Theoretical Supply</span>:&nbsp;
                        {state && bigNumberToDecimalString(state.theoreticalSupply, 18, 18)}
                    </p>
                </div>
                {/* Front Office States */}
                <div className="h-full w-full px-4 py-3 space-y-1 overflow-y-auto bg-white shadow-md">
                    <p className="font-semibold mb-1 py-1 border-b border-translucent-light-gray">
                        Front Office States
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold py-1">Fund Token Balance</span>
                        :&nbsp;
                        {bigNumberToDecimalString(frontOfficeFTBalance, 18, 18)}
                    </p>
                </div>
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Front Office Allowed Tokens</p>
                    {allowedTokens.map((allowedToken) => (
                        <div key={allowedToken.address} className="py-1 text-sm">
                            <p>
                                <span className="font-semibold">Symbol</span>:&nbsp;
                                {allowedToken.symbol}
                            </p>
                            <p>
                                <span className="font-semibold">Address</span>:&nbsp;
                                {allowedToken.address}
                            </p>
                            <p>
                                <span className="font-semibold">Oracle</span>:&nbsp;
                                {allowedToken.oracle}
                            </p>
                            <p>
                                <span className="font-semibold">Front Office Balance</span>:&nbsp;
                                {bigNumberToDecimalString(allowedToken.frontOfficeBalance, 18, 18)}
                            </p>
                        </div>
                    ))}
                </div>
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Incentives</p>
                    {incentives.map((incentive) => (
                        <div key={incentive.address} className="py-1 text-sm">
                            <p>
                                <span className="font-semibold">Name</span>:&nbsp;
                                {incentive.name}
                            </p>
                            <p>
                                <span className="font-semibold">Address</span>:&nbsp;
                                {incentive.address}
                            </p>
                            <p>
                                <span className="font-semibold">Fund Token Balance</span>:&nbsp;
                                {bigNumberToDecimalString(incentive.incentiveBalance, 18, 18)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Overview;
