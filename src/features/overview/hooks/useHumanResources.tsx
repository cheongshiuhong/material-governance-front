// Types
import type { Contract } from 'ethers';
import { EmployeeDetails } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import contracts from '@constants/contracts';

type UseHumanResourcesReturn = {
    employees: (EmployeeDetails & {
        address: string;
        currentRemuneration: BigNumber;
    })[];
    unredeemedExEmployees: (EmployeeDetails & {
        address: string;
        currentRemuneration: BigNumber;
    })[];
};

/**
 * Custom hook to retrieve details about the HR.
 *
 * @returns {UseHumanResourcesReturn} - The hr's details.
 */
const useHumanResources = (): UseHumanResourcesReturn => {
    const { readProvider } = useWeb3Context();

    const [employees, setEmployees] = useState<UseHumanResourcesReturn['employees']>([]);
    const [unredeemedExEmployees, setUnredeemedExEmployees] = useState<
        UseHumanResourcesReturn['unredeemedExEmployees']
    >([]);

    /**
     * Fetches the employees details.
     *
     * @private
     * @param {Contract} hrContract - The hr contract.
     * @returns {Promise<UseHumanResourcesReturn['employees']>} - The fetched employees details.
     */
    const _fetchEmployees = async (
        hrContract: Contract
    ): Promise<UseHumanResourcesReturn['employees']> =>
        Promise.all(
            Array.from(Array((await hrContract.getEmployeeCount()).toNumber()).keys()).map(
                async (index) => {
                    const [address, details] = await hrContract.getEmployeeByIndex(index);
                    const [currentRemuneration] = await hrContract.getEmployeeCurrentRemuneration(
                        address
                    );
                    return { address, ...details, currentRemuneration };
                }
            )
        );

    /**
     * Fetches the unredeemed ex-employees details.
     *
     * @private
     * @param {Contract} hrContract - The hr contract.
     * @returns {Promise<UseHumanResourcesReturn['unredeemedExEmployees']>} - The fetched
     *   ex-employees details.
     */
    const _fetchUnredeemedExEmployees = async (
        hrContract: Contract
    ): Promise<UseHumanResourcesReturn['unredeemedExEmployees']> => {
        const [addresses, manyDetails]: [string[], EmployeeDetails[]] =
            await hrContract.getUnredeemedExEmployees();

        return await Promise.all(
            addresses.map(async (address, index) => {
                const [currentRemuneration] = await hrContract.getEmployeeCurrentRemuneration(
                    address
                );
                return { address, ...manyDetails[index], currentRemuneration };
            })
        );
    };

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!readProvider) return;
            const hrContract = contracts.hr.connect(readProvider);

            // Get the employees
            const [employeesResponse, unredeemedExEmployeesResponse] = await Promise.all([
                _fetchEmployees(hrContract),
                _fetchUnredeemedExEmployees(hrContract)
            ]);

            setEmployees(employeesResponse);
            setUnredeemedExEmployees(unredeemedExEmployeesResponse);
        };

        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readProvider]);

    return { employees, unredeemedExEmployees };
};

export default useHumanResources;
