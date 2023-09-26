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

export const preload = (chain: SubstrateChain, userAddress: string) => {
    void getUserVotes(chain, userAddress);
};

export const getUserVotes = cache(
    async (chain: SubstrateChain, userAddress: string) => {
        const safeChain = (chain as SubstrateChain) || SubstrateChain.Kusama;
        const chainConfig = await getChainByName(safeChain);
        const { api } = chainConfig;

        if (typeof api === "undefined") {
            throw `can not get api of ${chain}`;
        }
        // const user = useAppStore((s) => s.user);

        // const referendaMap = new Map();

        // console.log(`Querying referenda.....`, { label: "Democracy" });
        // const { ongoingReferenda, finishedReferenda } =
        //     await getOpenGovReferenda(api);
        // console.log(
        //     `Got ${ongoingReferenda.length} ongoing referenda, ${finishedReferenda.length} finished referenda`,
        //     { label: "Democracy" }
        // );
        // for (const ref of ongoingReferenda) {
        //     referendaMap.set(ref.index, ref);
        // }

        const votesTillNow = await api.query.convictionVoting.votingFor.entries(userAddress);

        const votingForTillNow: VotePolkadot[] = votesTillNow?.map(transformVoteMulti);

        let formattedVotes = [];
        let delegations = [];

        console.log(votingForTillNow.length, "votes qureied")

        //format all direct votes

        for (const vote of votingForTillNow) {
            if (vote.voteData.isCasting) {
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
                    const formattedVote = await formatVote(accountId, track, index.toString(), referendumVote, delegationCapital.toString(), delegationVotes.toString())
                    if (formattedVote) {
                        formattedVotes.push(formattedVote);
                    }
                }
            }
            else {
                delegations.push(await formatDelegation(vote));
            }

        }
        console.log(
            `Finished adding ${formattedVotes.length} votes`,
            {
                label: "User Votes",
            }
        );

        for (const delegation of delegations) {
            let formattedDelegatedToVotes = [];

            const delegatedTovotesTillNow = await api.query.convictionVoting.votingFor.entries(delegation.target);

            const delegatedToVotingForTillNow: VotePolkadot[] = delegatedTovotesTillNow?.map(transformVoteMulti);
            for (const vote of delegatedToVotingForTillNow) {
                if (vote.voteData.isCasting) {
                    const { accountId, track } = vote;
                    if (track == delegation.track) {
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
                            const formattedVote = await formatVote(accountId, track, index.toString(), referendumVote, delegationCapital.toString(), delegationVotes.toString())
                            if (formattedVote) {
                                formattedDelegatedToVotes.push(formattedVote);
                            }
                        }
                    }
                }
            }
            formattedVotes.push(formatDelegatedVotes(delegation, formattedDelegatedToVotes))

        }



        // for (const del of delegating) {
        //     delegationsAt.push(await formatDelegation(del));
        // }

        // console.log(`Added ${delegationsAt.length} delegations`, {
        //     label: "Democracy",
        // });

        // for (const delegation of delegationsAt) {
        //     const delegatedToVotes: DecoratedConvictionVote[] = formattedVotes.filter((vote) => {
        //         return (
        //             vote.address == delegation.target &&
        //             vote.track == delegation.track
        //         );
        //     });
        //     if (delegatedToVotes.length > 0) {
        //         //format delegated votes
        //         formattedVotes.push(...(await formatDelegatedVotes(delegation, delegatedToVotes)));
        //     }

        // }

        // const userVotes: DecoratedConvictionVote[] = formattedVotes.filter(vote => vote.address == userAddress);


        console.log(
            `Finished filtering and formatting ${formattedVotes.length} user votes for ongoing referenda.`,
            {
                label: "Democracy",
            }
        );
        // console.log(formattedVotes)

        return formattedVotes;
    }
);
