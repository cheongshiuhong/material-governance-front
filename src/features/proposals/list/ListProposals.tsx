// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';
import { IoIosAddCircleOutline } from 'react-icons/io';

// Code
import useRouter from '@hooks/useRouter';
import useListAllProposals from './hooks/useListAllProposals';
import useListActiveProposals from './hooks/useListActiveProposals';
import ProposalDisplay from './ProposalDisplay';

/**
 * The list proposals component.
 *
 * @returns {ReactElement} - The list proposals component.
 */
const ListProposals: FC = (): ReactElement => {
    const { allProposals, total, hasMore, loadMore } = useListAllProposals();
    // const { activeProposals } = useListActiveProposals();
    const { redirect } = useRouter();
    const [tab, setTab] = useState<number>(0);

    return (
        <div className="mx-auto w-[320px] sm:w-[480px] md:w-[640px] lg:w-[720px] space-y-6">
            <div className="w-full flex justify-between">
                <div className="flex space-x-2 border-b border-translucent-dark-gray">
                    <button
                        onClick={() => setTab(0)}
                        className={`px-3 py-1 rounded-t-md ${
                            tab === 0 && 'bg-translucent-light-gray shadow-lg'
                        }`}>
                        Active
                    </button>
                    <button
                        onClick={() => setTab(1)}
                        className={`px-3 py-1 rounded-t-md ${
                            tab === 1 && 'bg-translucent-light-gray shadow-lg'
                        }`}>
                        All
                    </button>
                </div>
                <button
                    onClick={() => redirect('/proposals/create')}
                    className="px-2 py-2 flex items-center space-x-1
                    bg-translucent-dark-gray text-white rounded-md
                    text-sm lg:text-base">
                    <IoIosAddCircleOutline size={20} />
                    <span>Create Proposal</span>
                </button>
            </div>
            <div className="w-full space-y-6">
                {/* Active proposals */}
                {/* {tab === 0 &&
                    (activeProposals.length ? (
                        activeProposals.map((activeProposal) => (
                            <ProposalDisplay
                                key={activeProposal.id.toString()}
                                proposal={activeProposal}
                            />
                        ))
                    ) : (
                        <p>No active proposals.</p>
                    ))} */}
                {/* Historical proposals */}
                {tab === 1 && (
                    <>
                        <p className="w-full mb-2 text-right">
                            Showing {allProposals.length} of {total.toString()}
                        </p>
                        {allProposals.map((proposal) => (
                            <ProposalDisplay key={proposal.id.toString()} proposal={proposal} />
                        ))}
                        {hasMore && (
                            <button
                                onClick={loadMore}
                                className="w-full mt-4 px-2 py-1 bg-translucent-dark-gray text-white rounded-md">
                                Load More
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ListProposals;
