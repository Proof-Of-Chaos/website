"use client";

import { title } from "@/components/primitives";
import { useSubstrateChain } from "@/context/substrate-chain-context";

import { useLatestUserVote } from "@/hooks/vote/use-latest-user-vote";

export default function VoteTestPage() {
  const { data: vote } = useLatestUserVote("all");

  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Test Latest User Vote</h1>
      Latest user vote:{" "}
      <pre className="text-tiny">{JSON.stringify(vote, null, 2)}</pre>
    </div>
  );
}
