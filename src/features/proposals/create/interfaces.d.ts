import { BigNumber } from '@ethersproject/bignumber';
import { EnumType } from '@interfaces/general';

export type InputValues = {
    contract: EnumType<string>;
    contractAddress?: EnumType<string>;
    function: EnumType<string>;
    arguments: unknown[];
    value: BigNumber;
};

export type AddressesOptions = {
    [index: string]: EnumType<string>[];
};
