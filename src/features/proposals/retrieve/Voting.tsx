// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Code
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';

type VotingProps = {
    castVote: (direction: number, reason: string) => Promise<void>;
    votingPower: BigNumber;
    totalVotingPower: BigNumber;
};

/**
 * The voting component.
 *
 * @param {VotingProps} props - The vote function.
 * @returns {ReactElement} - The voting component.
 */
const Voting: FC<VotingProps> = ({
    castVote,
    votingPower,
    totalVotingPower
}: VotingProps): ReactElement => {
    const [voteReason, setVoteReason] = useState<string>('');
    const [error, setError] = useState<string>('');

    const submitVote = async (direction: number) => {
        try {
            await castVote(direction, voteReason);
        } catch (err) {
            if (err.code === 4001) return;
            setError(`Error: unexpected error. ${err.data?.message || err.message}`);
        }
    };

    return (
        <div className="w-full px-3 py-3 space-y-4 overflow-x-auto bg-white shadow-md">
            <p className="text-base lg:text-lg font-semibold">Cast My Vote</p>
            <div className="mt-2">
                <label htmlFor="vote-reason" className="font-semibold">
                    Reason for Vote (optional)
                </label>
                <input
                    type="text"
                    id="vote-reason"
                    aria-label="vote-reason"
                    value={voteReason}
                    onChange={(e) => setVoteReason(e.target.value)}
                    className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                />
            </div>
            <div className="w-full flex items-center justify-between">
                <p>
                    <span className="font-semibold">My&nbsp;Voting&nbsp;Power</span>:&nbsp;
                    {totalVotingPower.eq(0) ? (
                        <>Snapshot not taken yet.</>
                    ) : (
                        <>
                            {bigNumberToDecimalString(votingPower, 18, 4)}&nbsp;/&nbsp;
                            {bigNumberToDecimalString(totalVotingPower, 18, 4)}
                            &nbsp;(
                            {bigNumberToDecimalString(
                                votingPower.mul(10_000).div(totalVotingPower),
                                2,
                                2
                            )}
                            %)
                        </>
                    )}
                </p>
                <div className="w-full mt-4 flex items-center justify-end space-x-3">
                    <button
                        onClick={() => submitVote(0)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md">
                        Vote For
                    </button>
                    <button
                        onClick={() => submitVote(1)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md">
                        Vote Against
                    </button>
                </div>
            </div>
            <p className="text-red-500 italic">{error}</p>
        </div>
    );
};

export default Voting;
