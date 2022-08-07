// Types
import type { DecodedFunctionCall } from './interfaces';

// Libraries
import { ethers } from 'ethers';

// Code
import { specificCalls, combinedGenericCalls } from './calls';

const tryDecodeReturnData = (
    returnData: string,
    decoder?: (returnData: string) => ethers.utils.Result
) => {
    try {
        // Regular decode if possible (failure either from decoder or when no decoder)
        if (decoder) return decoder(returnData);
        throw Error();
    } catch (err) {
        try {
            // Try to decode as revert message string
            return ethers.utils
                .toUtf8String(ethers.utils.hexDataSlice(returnData, 68))
                .replaceAll('\x00', '');
        } catch (err) {
            // No decode at all
            return returnData;
        }
    }
};

/**
 * Decodes the call data for a call on a contract.
 *
 * @param {string} address - The address of the contract called on.
 * @param {string} callData - The encoded hexadecimal string of the call data.
 * @param {string} returnData - The encoded hexadecimal string of the return data.
 * @returns {DecodedFunctionCall} - The decoded info on the call address and data.
 */
const decodeAbi = (address: string, callData: string, returnData: string): DecodedFunctionCall => {
    const selector = callData.slice(0, 10);

    // Try to match an address-specific call then a generic call
    const matchedCall = specificCalls[address]?.calls[selector] || combinedGenericCalls[selector];
    if (matchedCall) {
        return {
            contractName: matchedCall.contractName,
            functionName: matchedCall.functionName,
            inputs: matchedCall.inputs,
            decodedCallData: matchedCall.decodeCallData(callData),
            decodedReturnData:
                returnData?.length > 2
                    ? tryDecodeReturnData(returnData, matchedCall.decodeReturnData)
                    : 'null'
        };
    }

    // Default case where no selectors match
    return {
        contractName: 'Unknown',
        functionName: 'Unknown',
        inputs: [{ name: 'raw', type: 'bytes' }],
        decodedCallData: [callData],
        decodedReturnData: returnData?.length > 2 ? tryDecodeReturnData(returnData) : 'null'
    };
};

export default decodeAbi;
