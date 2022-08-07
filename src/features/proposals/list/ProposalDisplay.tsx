// Types
import type { FC, ReactElement } from 'react';
import type { Proposal } from '@interfaces/general';

// Code
import useRouter from '@hooks/useRouter';
import StatusBadge from '@components/proposals/StatusBadge';

type ProposalDisplayProps = {
    proposal: Proposal;
};

/**
 * The proposal display component.
 *
 * @param {ProposalDisplayProps} props - The proposal to display.
 * @returns {ReactElement} - The proposal display component.
 */
const ProposalDisplay: FC<ProposalDisplayProps> = ({
    proposal
}: ProposalDisplayProps): ReactElement => {
    const { redirect } = useRouter();

    return (
        <div className="overflow-x-auto px-4 py-2 bg-white shadow-md rounded-md">
            <p className="text-xs sm:text-sm md:text-base">
                <span className="font-semibold">Proposal ID</span>:&nbsp;{proposal.id.toString()}
            </p>
            <p className="text-xs sm:text-sm md:text-base">
                <span className="font-semibold">Proposer</span>:&nbsp;{proposal.proposer}
            </p>
            <p className="text-xs sm:text-sm md:text-base">
                <span className="font-semibold">Description</span>: {proposal.description}
            </p>
            <p className="text-xs sm:text-sm md:text-base">
                <span className="font-semibold">Block</span>: {proposal.startBlock.toString()}
                &nbsp;-&nbsp;{proposal.endBlock.toString()}
            </p>
            <p className="text-xs sm:text-sm md:text-base">
                <span className="font-semibold">Status</span>:&nbsp;
                <StatusBadge
                    statusCode={proposal.status}
                    blockExecuted={proposal.blockExecuted.toString()}
                />
            </p>
            <div className="mt-2 border-b border-translucent-dark-gray"></div>
            <button
                onClick={() => redirect(`/proposals/${proposal.id}`)}
                className="w-full mt-3 px-2 py-2 bg-translucent-dark-gray text-white rounded-md">
                View
            </button>
        </div>
    );
};

export default ProposalDisplay;
