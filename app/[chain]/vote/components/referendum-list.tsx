"use client";

import { UIReferendum, UITrack } from "../types";
import { DecoratedConvictionVote, SubstrateChain } from "@/types";

import { ReferendumDetail, ReferendumDetailLoading } from "./referendum-detail";
import { TrackFilter } from "./track-filter";
import { Suspense, use } from "react";
import { useAppStore } from "@/app/zustand";
import { getChainInfo } from "@/config/chains";
import { ReferendumNotFound } from "./referendum-not-found";
import { useUserVotes } from "@/hooks/vote/use-user-votes";
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
      const findResult = votes?.find(
        (vote) => vote.referendumIndex === ref.index
      );
      console.log("findResult", ref.index, findResult);
      return findResult !== undefined;
      // } else if (trackFilter === "unvoted") {
      //   return (
      //     userVotes?.find()
      //   );
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
              (delegation) =>
                delegation.track &&
                delegation.track.toString() === track?.id.toString()
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
    </div>
  );
}
