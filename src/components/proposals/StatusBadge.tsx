// Types
import type { FC, ReactElement } from 'react';

type StatusBadgeProps = {
    statusCode: number;
    blockExecuted: string;
};

/**
 * Formats a proposal's status into a badge component.
 *
 * @param {number} statusCode - The status code of a proposal.
 * @returns {ReactElement} - The status badge component.
 */
const StatusBadge: FC<StatusBadgeProps> = ({
    statusCode,
    blockExecuted
}: StatusBadgeProps): ReactElement => {
    if (statusCode === 0)
        return (
            <span className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded-md">
                Pending
            </span>
        );
    if (statusCode === 1)
        return (
            <span className="px-1.5 py-0.5 text-xs bg-red-500  text-white rounded-md">
                Rejected (Block {blockExecuted})
            </span>
        );
    if (statusCode === 2)
        return (
            <span className="px-1.5 py-0.5 text-xs bg-green-600 text-white rounded-md">
                Approved and Executed (Block {blockExecuted})
            </span>
        );
    if (statusCode === 3)
        return (
            <span className="px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-md">
                Aproved but Failed (Block {blockExecuted})
            </span>
        );

    return (
        <span className="px-1.5 py-0.5 text-xs flex bg-gray-300 text-white rounded-md">
            Unknown (Block {blockExecuted})
        </span>
    );
};

export default StatusBadge;
