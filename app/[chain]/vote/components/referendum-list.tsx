"use client";

import { UIReferendum, UITrack } from "../types";
import { DecoratedConvictionVote, SubstrateChain } from "@/types";

import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { ReferendumDetail, ReferendumDetailLoading } from "./referendum-detail";
import { TrackFilter } from "./track-filter";
import { Suspense } from "react";
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

  const { data: userVotes, isLoading: isUserVotesLoading } =
    useLatestUserVotes("ongoing");

  const filteredReferenda = referenda?.filter((ref) => {
    if (trackFilter === "all") {
      return true;
    } else if (trackFilter === "voted") {
      const findResult = userVotes?.find(
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
      {/* <pre className="text-tiny">{JSON.stringify(userVotes, null, 2)}</pre> */}
      {filteredReferenda && filteredReferenda.length > 0 ? (
        <>
          <AnimatePresence>
            {filteredReferenda?.map((ref) => {
              const track = tracks?.find(
                (track) => track.id.toString() === ref.track
              );
              return (
                <motion.div
                  key={ref.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
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
                    />
                  </Suspense>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </>
      ) : (
        <ReferendumNotFound />
      )}
    </div>
  );
}
