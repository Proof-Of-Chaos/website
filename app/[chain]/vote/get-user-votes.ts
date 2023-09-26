import { transformReferendum, transformVoteMulti } from "@/app/[chain]/vote/util";
import { useAppStore } from "@/app/zustand";
import { getChainByName } from "@/config/chains";
import { DecoratedConvictionVote, SubstrateChain, VotePolkadot } from "@/types";
import { cache } from "react";
import "server-only";
import type {
    PalletConvictionVotingVoteVoting,
} from "@polkadot/types/lookup";
import { getOpenGovReferenda } from "@/app/api/rewards/get-conviction-voting";
import { formatDelegatedVotes, formatDelegation, formatVote } from "@/app/api/rewards/util";

export const preload = (chain: SubstrateChain) => {
    void getUserVotes(chain);
};

export const getUserVotes = cache(
    async (chain: SubstrateChain) => {
        const safeChain = (chain as SubstrateChain) || SubstrateChain.Kusama;
        const chainConfig = await getChainByName(safeChain);
        const { api } = chainConfig;

        if (typeof api === "undefined") {
            throw `can not get api of ${chain}`;
        }
        // const user = useAppStore((s) => s.user);
        const userAddress = "FF4KRpru9a1r2nfWeLmZRk6N8z165btsWYaWvqaVgR6qVic";

        const referendaMap = new Map();

        console.log(`Querying referenda.....`, { label: "Democracy" });
        const { ongoingReferenda, finishedReferenda } =
            await getOpenGovReferenda(api);
        console.log(
            `Got ${ongoingReferenda.length} ongoing referenda, ${finishedReferenda.length} finished referenda`,
            { label: "Democracy" }
        );
        for (const ref of ongoingReferenda) {
            referendaMap.set(ref.index, ref);
        }

        const votesTillNow = await api.query.convictionVoting.votingFor.entries();

        const votingForTillNow: VotePolkadot[] = votesTillNow?.map(transformVoteMulti);
        const casting: VotePolkadot[] = [];
        const delegating: VotePolkadot[] = [];
        for (const vote of votingForTillNow) {
            if (vote.voteData.isCasting) {
                casting.push(vote);
            } else {
                delegating.push(vote);
            }
        }

        let formattedVotes = [];
        let delegationsAt = [];

        //format all direct votes

        for (const vote of casting) {

            const { accountId, track } = vote;

            // For each given track, these are the invididual votes for that track,
            //     as well as the total delegation amounts for that particular track

            // The total delegation amounts.
            //     delegationVotes - the _total_ amount of tokens applied in voting. This takes the conviction into account
            //     delegationCapital - the base level of tokens delegated to this address
            const {
                votes,
                delegations: { votes: delegationVotes, capital: delegationCapital },
            } = vote.voteData.asCasting;

            // push the given referendum votes to refVotes
            for (const [index, referendumVote] of votes) {
                const isReferendumOngoing =
                    referendaMap.get(referendumVote.index)?.endedAt == undefined;

                if (isReferendumOngoing) {
                    const formattedVote = await formatVote(accountId, track, index.toString(), referendumVote, delegationCapital.toString(), delegationVotes.toString())
                    if (formattedVote) {
                        formattedVotes.push(formattedVote);
                    }
                }
            }
        }
        console.log(
            `Finished adding ${formattedVotes.length} votes`,
            {
                label: "User Votes",
            }
        );



        for (const del of delegating) {
            delegationsAt.push(await formatDelegation(del));
        }

        console.log(`Added ${delegationsAt.length} delegations`, {
            label: "Democracy",
        });

        for (const delegation of delegationsAt) {
            const delegatedToVotes: DecoratedConvictionVote[] = formattedVotes.filter((vote) => {
                return (
                    vote.address == delegation.target &&
                    vote.track == delegation.track
                );
            });
            if (delegatedToVotes.length > 0) {
                //format delegated votes
                formattedVotes.push(...(await formatDelegatedVotes(delegation, delegatedToVotes)));
            }

        }

        const userVotes: DecoratedConvictionVote[] = formattedVotes.filter(vote => vote.address == userAddress);


        console.log(
            `Finished filtering and formatting ${userVotes.length} user votes for ongoing referenda.`,
            {
                label: "Democracy",
            }
        );

        return userVotes;
    }
);
