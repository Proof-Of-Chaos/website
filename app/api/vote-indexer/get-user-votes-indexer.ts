import {
  transformReferendum,
  transformVoteMulti,
} from "@/app/[chain]/vote/util";
import { useAppStore } from "@/app/zustand";
import { getChainByName } from "@/config/chains";
import { ConvictionDelegation, DecoratedConvictionVote, ResponseDataWalletVotesIndexer, SubstrateChain, VotePolkadot } from "@/types";
import { cache } from "react";
import type { PalletConvictionVotingVoteVoting } from "@polkadot/types/lookup";
import { getOpenGovReferenda } from "@/app/api/rewards/get-conviction-voting";
import {
  formatDelegatedVotes,
  formatDelegation,
  formatVote,
} from "@/app/api/rewards/util";
import { getOngoingReferenda } from "@/app/[chain]/vote/get-referenda";
import { UIReferendum } from "@/app/[chain]/vote/types";
import { INDEXER_HEALTH, QUERY_USER_VOTES } from "../_queries";
import { request, gql } from "graphql-request";


const checkIndexerHealth = (response: ResponseDataWalletVotesIndexer) => {
  if (!response._metadata.indexerHealthy) {
    throw new Error("Indexer is not healthy!");
  }
}


export const getUserVotesIndexer =
  async (chain: SubstrateChain, userAddress: string, referendaFilter: string): Promise<DecoratedConvictionVote[]> => {
    const safeChain = (chain as SubstrateChain) || SubstrateChain.Kusama;
    const chainConfig = await getChainByName(safeChain);
    const { api } = chainConfig;

    if (typeof api === "undefined") {
      throw `can not get api of ${chain}`;
    }

    let votes_query = QUERY_USER_VOTES

    const variables = {
      filterCastingVote: {
        voter: {
          equalTo: "DT7kRjGFvRKxGSx5CPUCA1pazj6gzJ6Db11xmkX4yYSNK7m"
        }
      },
      filterDelegatorVote: {
        delegator: {
          equalTo: "DT7kRjGFvRKxGSx5CPUCA1pazj6gzJ6Db11xmkX4yYSNK7m"
        }
      }
    };


    const response: ResponseDataWalletVotesIndexer = await request(
      "https://api.subquery.network/sq/nova-wallet/nova-wallet-kusama-governance2",
      votes_query,
      variables
    );

    checkIndexerHealth(response);

    const votesTillNow = await api.query.convictionVoting.votingFor.entries(
      userAddress
    );

    const votingForTillNow: VotePolkadot[] =
      votesTillNow?.map(transformVoteMulti);

    let formattedVotes: DecoratedConvictionVote[] = [];
    let delegations: ConvictionDelegation[] = [];

    //format all direct votes

    for (const vote of votingForTillNow) {
      if (vote.voteData.isCasting) {
        const { accountId, track } = vote;

        // For each given track, these are the invididual votes for that track,
        // as well as the total delegation amounts for that particular track

        // The total delegation amounts.
        //     delegationVotes - the _total_ amount of tokens applied in voting. This takes the conviction into account
        //     delegationCapital - the base level of tokens delegated to this address
        const {
          votes,
          delegations: { votes: delegationVotes, capital: delegationCapital },
        } = vote.voteData.asCasting;

        // push the given referendum votes to refVotes
        for (const [index, referendumVote] of votes) {
          const formattedVote: DecoratedConvictionVote | undefined = formatVote(
            accountId,
            track,
            index.toString(),
            referendumVote,
            delegationCapital.toString(),
            delegationVotes.toString()
          );
          if (formattedVote) {
            formattedVotes.push(formattedVote);
          }
        }
      } else {
        delegations.push(await formatDelegation(vote));
      }
    }

    const directVoteCount = formattedVotes.length
    console.log(`Finished adding ${directVoteCount} direct votes`, {
      label: "User Votes",
    });

    for (const delegation of delegations) {
      let formattedDelegatedToVotes = [];

      const delegatedTovotesTillNow =
        await api.query.convictionVoting.votingFor.entries(delegation.target);

      const delegatedToVotingForTillNow: VotePolkadot[] =
        delegatedTovotesTillNow?.map(transformVoteMulti);
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
              delegations: {
                votes: delegationVotes,
                capital: delegationCapital,
              },
            } = vote.voteData.asCasting;
            // push the given referendum votes to refVotes
            for (const [index, referendumVote] of votes) {
              const formattedVote: DecoratedConvictionVote | undefined = await formatVote(
                accountId,
                track,
                index.toString(),
                referendumVote,
                delegationCapital.toString(),
                delegationVotes.toString()
              );
              if (formattedVote) {
                formattedDelegatedToVotes.push(formattedVote);
              }
            }
          }
        }
      }
      const formattedDelegations: DecoratedConvictionVote[] = await formatDelegatedVotes(delegation, formattedDelegatedToVotes)
      if (formattedDelegations.length > 0) {
        formattedVotes.push(
          ...formattedDelegations
        );
      }
    }

    console.log(`Finished adding ${formattedVotes.length - directVoteCount} delegated votes`, {
      label: "User Votes",
    });

    switch (referendaFilter) {
      case "ongoing":
        const ongoingRefs: UIReferendum[] = await getOngoingReferenda(chain);
        const ongoingRefsIndices = ongoingRefs.map(ref => ref.index);
        formattedVotes = formattedVotes.filter(vote => ongoingRefsIndices.includes(vote.referendumIndex));
        formattedVotes.sort((a, b) => parseInt(b.referendumIndex) - parseInt(a.referendumIndex));
        break;
      default:
        // filter out only that ref
        formattedVotes = formattedVotes.filter(vote => vote.referendumIndex === referendaFilter);
    }

    console.log(
      `Finished filtering and formatting ${formattedVotes.length} user votes for referenda with filter "${referendaFilter}".`,
      {
        label: "User Votes",
      }
    );

    return formattedVotes;
  }
