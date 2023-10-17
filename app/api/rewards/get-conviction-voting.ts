import {
  PalletReferendaReferendumInfoConvictionVotingTally} from "@polkadot/types/lookup";
import { ConvictionDelegation, ConvictionVote, DecoratedConvictionVote, VotePolkadot } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { StorageKey, u32, Option } from "@polkadot/types";

import { BN } from "@polkadot/util";
import { formatDelegatedVotes, formatDelegation, formatVote, getApiAt } from "./util";
import {
  transformReferendum,
  transformVoteMulti,
} from "@/app/[chain]/vote/util";
import { ReferendumPolkadot } from "@/app/[chain]/vote/types";

type ReferendumInfo = [
  id: StorageKey<[u32]> | string,
  info: Option<PalletReferendaReferendumInfoConvictionVotingTally>
];

export const getOpenGovReferenda = async (
  api: ApiPromise,
  referendumIndex?: string
) => {
  if (!api) {
    throw new Error("No API provided.");
  }

  const openGovRefs: ReferendumInfo[] = referendumIndex
    ? [
      [
        referendumIndex.toString(),
        await api.query.referenda.referendumInfoFor(referendumIndex),
      ],
    ]
    : await api.query.referenda.referendumInfoFor.entries();

  const referenda: ReferendumPolkadot[] = openGovRefs.map(transformReferendum);
  const ongoingReferenda: ReferendumPolkadot[] = [];
  const finishedReferenda: ReferendumPolkadot[] = [];
  let totalIssuance: string | undefined;

  if (referendumIndex) {
    totalIssuance = (await api.query.balances.totalIssuance()).toString();
  }

  for (const referendum of referenda) {
    if (isReferendumFinished(referendum)) {
      const finishedRef = await processFinishedReferendum(api, referendum);
      finishedReferenda.push(finishedRef);
    } else {
      ongoingReferenda.push(referendum);
    }
  }

  return { ongoingReferenda, finishedReferenda, totalIssuance };
};

const isReferendumFinished = (referendum: ReferendumPolkadot): boolean => {
  const finishedStatuses = ["approved", "cancelled", "rejected", "timedOut"];
  return (
    finishedStatuses.includes(referendum.status) &&
    referendum.endedAt !== undefined
  );
};

const processFinishedReferendum = async (
  api: ApiPromise,
  referendum: ReferendumPolkadot
): Promise<ReferendumPolkadot> => {
  const apiAt = await getApiAt(
    api,
    new BN(referendum.endedAt!).subn(1).toNumber()
  );
  const referendumInfo: ReferendumInfo = [
    referendum.index as StorageKey<[u32]> | string,
    await apiAt.query.referenda.referendumInfoFor(referendum.index),
  ];
  const referendumInfoWhileOngoing = transformReferendum(referendumInfo);
  referendumInfoWhileOngoing.endedAt = referendum.endedAt;
  referendumInfoWhileOngoing.status = referendum.status;

  return referendumInfoWhileOngoing;
};

// OpenGov Conviction Voting
export const getConvictionVoting = async (
  api: ApiPromise | undefined,
  referendumIndex?: string
) => {
  try {
    console.log(`Querying conviction voting.....`, { label: "Democracy" });
    if (!api) {
      throw "no api";
    }
    const finishedVotes: ConvictionVote[] = [];
    const ongoingVotes: ConvictionVote[] = [];

    // Create a map to more easily check the status of a referenda, is it ongoing or finished
    const referendaMap = new Map();
    console.log(`Querying referenda.....`, { label: "Democracy" });
    const { ongoingReferenda, finishedReferenda, totalIssuance } =
      await getOpenGovReferenda(api, referendumIndex);
    console.log(
      `Got ${ongoingReferenda.length} ongoing referenda, ${finishedReferenda.length} finished referenda`,
      { label: "Democracy" }
    );
    for (const ref of ongoingReferenda) {
      referendaMap.set(ref.index, ref);
    }
    for (const ref of finishedReferenda) {
      referendaMap.set(ref.index, ref);
    }
    let queriedReferendum: ReferendumPolkadot | undefined;

    if (referendumIndex) {
      queriedReferendum = referendaMap.get(referendumIndex);
    }

    // Query the keys and storage of all the entries of `votingFor`
    // These are all the accounts voting, for which tracks, for which referenda
    // And whether they are delegating or not.
    console.log(`Querying conviction voting from the chain...`, {
      label: "Democracy",
    });

    // Create a vote entry for everyone that is delegating for current ongoing referenda
    console.log(`Finished querying ongoing delegations`, {
      label: "Democracy",
    });

    // FINISHED REFERENDA
    // Query the delegations for finished referenda at previous block heights
    // - Iterate through each previous finished referendum
    // - For each finished referendum, querying the state of voting at the block height of one block before the referendum was confirmed
    // -
    for (const referendum of finishedReferenda) {
      console.log(
        `Querying delegations for referenda #${referendum.index} [${referendum.index}/${finishedReferenda.length}]`,
        {
          label: "Democracy",
        }
      );
      if (!referendum.track) {
        throw new Error(`Missing track for this referendum`)
      }
      if (!referendum.endedAt) {
        throw new Error("endedAt is undefined for a past referendum");
      }
      const apiAt = await getApiAt(
        api,
        new BN(referendum.endedAt).subn(1).toNumber()
      );

      // The list of accounts in the network that have votes.
      const openGovVotesTillRefEnd =
        await apiAt.query.convictionVoting.votingFor.entries();

      const votingForTillRefEnd: VotePolkadot[] =
        openGovVotesTillRefEnd?.map(transformVoteMulti);

      console.log(
        `Got voting until ref end ${votingForTillRefEnd.length} entries`,
        {
          label: "Democracy",
        }
      );

      // All the votes for the given referendum (casted and delegated)
      const refVotes: DecoratedConvictionVote[] = [];
      // Direct delegated votes for the referendum
      const delegationsAt: ConvictionDelegation[] = [];

      // Iterate through the list of accounts in the network that are voting and make a list of regular, casted, non-delegated votes (`refVotes`)
      for (const vote of votingForTillRefEnd) {
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
            if (index.toString() == referendum.index) {
              const formattedVote = await formatVote(accountId, track, index.toString(), referendumVote, delegationCapital.toString(), delegationVotes.toString())
              if (formattedVote) {
                finishedVotes.push(formattedVote);
                refVotes.push(formattedVote);
              }
            }
          }
        }
      }
      console.log(
        `Finished adding ${finishedVotes.length} finished votes for referendum #${referendum.index}`,
        {
          label: "Democracy",
        }
      );

      // Make a list of the delegations there were at this previous block height
      for (const vote of votingForTillRefEnd) {
        // format delegations
        if (
          vote.voteData.isDelegating && vote.track == parseInt(referendum.track)
        ) {
          delegationsAt.push(await formatDelegation(vote));
        }
      }

      console.log(
        `Finished adding ${delegationsAt.length} delegations at expiry of referendum #${referendum.index}`,
        {
          label: "Democracy",
        }
      );

      // Go through the list of delegations and try to find any immediate corresponding direct votes, if there are no immediate delegations, add it to the list of nested delegations.
      for (const delegation of delegationsAt) {
        // Try and find the delegated vote from the existing votes
        const delegatedToVotes = refVotes.filter((vote) => {
          return (
            vote.referendumIndex == referendum.index &&
            vote.address == delegation.target &&
            vote.track == delegation.track
          );
        });
        if (delegatedToVotes.length > 0) {
          //format delegated votes
          finishedVotes.push(...(await formatDelegatedVotes(delegation, delegatedToVotes)));
        }
      }
      console.log(
        `Finished adding ${finishedVotes.length} delegations to finishedVotes at expiry of referendum #${referendum.index}`,
        {
          label: "Democracy",
        }
      );

      const convictionVoting = {
        referendum: queriedReferendum ? queriedReferendum : undefined,
        totalIssuance,
        referendaVotes: [...finishedVotes, ...ongoingVotes],
      };
      return convictionVoting;
    }
  } catch (e) {
    console.log(`Error in getConvictionVoting: ${JSON.stringify(e)}`, {
      label: "Democracy",
    });
  }
};
