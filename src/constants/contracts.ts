// Libraries
import { ethers } from 'ethers';

// Constants
import addresses from './addresses';

// ABIs
import CAOABI from '@abis/CAO.json';
import CAOTokenABI from '@abis/CAOToken.json';
import CAOParametersABI from '@abis/CAOParameters.json';
import HumanResourcesABI from '@abis/HumanResources.json';
import AccountingABI from '@abis/Accounting.json';
import FrontOfficeABI from '@abis/FrontOffice.json';
import FrontOfficeParametersABI from '@abis/FrontOfficeParameters.json';
import IncentivesManagerABI from '@abis/IncentivesManager.json';
import IIncentiveABI from '@abis/IIncentive.json';
import MainFundTokenABI from '@abis/MainFundToken.json';
import MainFundABI from '@abis/MainFund.json';
import ERC20ABI from '@abis/ERC20.json';

export default {
    // Address-specific contracts
    cao: new ethers.Contract(addresses.cao, CAOABI),
    caoToken: new ethers.Contract(addresses.caoToken, CAOTokenABI),
    caoParameters: new ethers.Contract(addresses.caoParameters, CAOParametersABI),
    hr: new ethers.Contract(addresses.hr, HumanResourcesABI),

    // Fund contracts
    mainFund: new ethers.Contract(ethers.constants.AddressZero, MainFundABI),
    mainFundToken: new ethers.Contract(ethers.constants.AddressZero, MainFundTokenABI),
    accounting: new ethers.Contract(ethers.constants.AddressZero, AccountingABI),
    frontOffice: new ethers.Contract(ethers.constants.AddressZero, FrontOfficeABI),
    frontOfficeParameters: new ethers.Contract(
        ethers.constants.AddressZero,
        FrontOfficeParametersABI
    ),
    incentivesManager: new ethers.Contract(ethers.constants.AddressZero, IncentivesManagerABI),
    iincentive: new ethers.Contract(ethers.constants.AddressZero, IIncentiveABI),

    // Generic contracts
    erc20: new ethers.Contract(ethers.constants.AddressZero, ERC20ABI)
};
