import { ReactNode } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type WrapperProps = {
    children?: ReactNode;
};

export type EnumType<T> = {
    label: string;
    value: T;
};

export type Proposal = {
    id: BigNumber;
    proposer: string;
    description: string;
    startBlock: BigNumber;
    endBlock: BigNumber;
    callAddresses: string[];
    callDatas: string[];
    callValues: number[];
    votesFor: BigNumber;
    votesAgainst: BigNumber;
    status: number;
    blockExecuted: BigNumber;
    returnDatas: string[];
};

export type Vote = {
    voter: string;
    direction: number;
    votingPower: BigNumber;
    reason: string;
};

export type EmployeeDetails = {
    remunerationPerBlock: BigNumber;
    remunerationAccrued: BigNumber;
    lastAccruedBlock: BigNumber;
};

export type FundDetails = {
    name: string;
    mainFundAddress: string;
    mainFundTokenAddress: string;
    accountingAddress: string;
    frontOfficeAddress: string;
    incentivesManagerAddress: string;
    caoFTBalance: BigNumber;
};
