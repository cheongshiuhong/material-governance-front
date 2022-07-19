// Types
import type { FunctionCall, ContractFunctions } from './interfaces';
import type { Contract } from 'ethers';

// Constants
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';

/**
 * Gets the functions from the contract object's abi.
 *
 * @param {string} name - The name to give to the contract.
 * @param {Contract} contract - The contract object.
 * @returns {ContractFunctions} - The mapping from selector the the details.
 */
const getContractFunctions = (name: string, contract: Contract): ContractFunctions => {
    const calls: ContractFunctions['calls'] = {};

    for (const funcName in contract.functions) {
        const func = contract.interface.getFunction(funcName);

        // Exclude view and pure functions
        if (['view', 'pure'].includes(func.stateMutability)) continue;

        const selector = contract.interface.getSighash(func);
        calls[selector] = {
            contractName: name,
            functionName: funcName,
            inputs: func.inputs,
            encodeCallData: (args: unknown[]) => contract.interface.encodeFunctionData(func, args),
            decodeCallData: (callData: string) =>
                contract.interface.decodeFunctionData(func, callData),
            decodeReturnData: (returnData: string) =>
                contract.interface.decodeErrorResult(func, returnData)
        };
    }
    return { name, calls };
};

/** Address-specific known calls */
export const specificCalls: Record<string, ContractFunctions> = {
    [addresses.cao]: getContractFunctions('CAO', contracts.cao),
    [addresses.caoToken]: getContractFunctions('CAO Token', contracts.caoToken),
    [addresses.caoParameters]: getContractFunctions('CAO Parameters', contracts.caoParameters),
    [addresses.hr]: getContractFunctions('HR', contracts.hr)
};

/** Non-address-specific generic calls */
export const genericCalls: Record<string, ContractFunctions> = {
    // Fund
    mainFund: getContractFunctions('Main Fund', contracts.mainFund),
    mainFundToken: getContractFunctions('Main Fund Token', contracts.mainFundToken),
    accounting: getContractFunctions('Accounting', contracts.accounting),
    frontOffice: getContractFunctions('Front Office', contracts.frontOffice),
    incentivesManager: getContractFunctions('Incentives Manager', contracts.incentivesManager),

    // Token
    erc20: getContractFunctions('ERC20', contracts.erc20)
};

/** Combined generic calls to facilitate lookups by selectors */
export const combinedGenericCalls: Record<string, FunctionCall> = Object.values(
    genericCalls
).reduce(
    (current, contractFunctions) => ({ ...current, ...contractFunctions.calls }),
    {} as Record<string, FunctionCall>
);

/** Combined calls */
export const combinedCalls = { ...specificCalls, ...genericCalls };
