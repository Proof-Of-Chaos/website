"use client";

import { UIReferendum, UITrack } from "../types";
import { DecoratedConvictionVote, SubstrateChain } from "@/types";

import { ReferendumDetail, ReferendumDetailLoading } from "./referendum-detail";
import { TrackFilter } from "./track-filter";
import { Suspense, use } from "react";
import { useAppStore } from "@/app/zustand";
import { getChainInfo } from "@/config/chains";
import { ReferendumNotFound } from "./referendum-not-found";
import { useLatestUserVotes } from "@/hooks/vote/use-latest-user-vote";

interface Props {
  referenda?: UIReferendum[];
  tracks?: UITrack[];
  chain: SubstrateChain;
}

export default function ReferendumList(props: Props) {
  const { referenda, tracks, chain } = props;

  const selectedChain = chain || SubstrateChain.Kusama;
  const chainInfo = getChainInfo(selectedChain);
  const { symbol, decimals } = chainInfo;

  const filters = useAppStore((state) => state.filters);
  const { trackFilter } = filters;

  const {
    data: { votes, delegations } = { votes: [], delegations: [] },
    isLoading: isUserVotesLoading,
  } = useLatestUserVotes("ongoing");

  const filteredReferenda = referenda?.filter((ref) => {
    if (trackFilter === "all") {
      return true;
    } else if (trackFilter === "voted") {
      const voted = votes?.find((vote) => vote.referendumIndex === ref.index);
      const delegated = delegations?.find(
        (delegation) => delegation.track.toString() === ref.track
      );
      return voted !== undefined && delegated === undefined;
    } else if (trackFilter === "delegated") {
      const shouldShow = delegations?.find(
        (del) => del.track.toString() === ref.track
      );
      console.log(ref.index, "shouldShow", shouldShow);
      return shouldShow !== undefined;
    } else if (trackFilter === "unvoted") {
      // remove all referenda that the user has delegations to
      const findResultDelegated = delegations?.find(
        (delegation) => delegation.track.toString() === ref.track
      );
      const findResultVoted = votes?.find(
        (vote) => vote.referendumIndex === ref.index
      );
      return findResultDelegated === undefined && findResultVoted === undefined;
    } else {
      return ref.track === trackFilter;
    }
  });

  return (
    <div className="referendum-list">
      <TrackFilter
        chain={chain as SubstrateChain}
        tracks={tracks}
        referenda={referenda}
      />
      {filteredReferenda && filteredReferenda.length > 0 ? (
        <>
          {filteredReferenda?.map((ref) => {
            const track = tracks?.find(
              (track) => track.id.toString() === ref.track
            );
            const userVote = votes?.find(
              (vote) => vote.referendumIndex === ref.index
            );
            const userDelegation = delegations?.find(
              (delegation) => delegation.track.toString() === track?.id
            );
            return (
              <div key={ref.index}>
                <Suspense
                  key={ref.index}
                  fallback={
                    <ReferendumDetailLoading
                      chain={chain as SubstrateChain}
                      referendum={ref}
                      track={track}
                    />
                  }
                >
                  <ReferendumDetail
                    chain={chain}
                    key={ref.index}
                    referendum={ref}
                    track={track}
                    isExpanded={false}
                    userVote={userVote}
                    userDelegation={userDelegation}
                    isUserVotesLoading={isUserVotesLoading}
                  />
                </Suspense>
              </div>
            );
          })}
        </>
      ) : (
        <ReferendumNotFound />
      )}
      {/* <pre className="text-tiny">
        {JSON.stringify(filteredReferenda, null, 2)}
      </pre> */}
    </div>
  );
}
