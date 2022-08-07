// Libraries
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

export type FunctionInput = {
    name: string;
    type: string;
    arrayChildren?: {
        type: string;
    };
    components?: FunctionInput[];
};

export type FunctionCall = {
    contractName: string;
    functionName: string;
    inputs: FunctionInput[];
    encodeCallData: (args: unknown[]) => string;
    decodeCallData: (callData: string) => ethers.utils.Result;
    decodeReturnData: (returnData: string) => ethers.utils.Result;
};

export type ContractFunctions = {
    name: string;
    calls: Record<string, FunctionCall>;
};

export type DecodedFunctionCall = {
    contractName: FunctionCall['contractName'];
    functionName: string;
    inputs: FunctionCall['inputs'];
    decodedCallData: ethers.utils.Result;
    decodedReturnData: ethers.utils.Result | string;
};

export type EncodedFunctionCall = {
    contractAddress: string;
    encodedCallData: string;
    value: BigNumber;
};
