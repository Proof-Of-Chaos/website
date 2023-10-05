"use client";

import { title } from "@/components/primitives";
import { useLatestUserVotes } from "@/hooks/vote/use-latest-user-vote";
import { usePAUserVotes } from "@/hooks/vote/use-pa-user-votes";

export function VoteTest() {
  const { data: votes, isLoading } = useLatestUserVotes("ongoing");
  const { data: paVotes, isLoading: isPALoading } = usePAUserVotes();

  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Test Latest User Vote</h1>
      <div className="flex gap-4">
        <div className="w-1/2">
          <p>Latest user vote Chain: </p>
          {isLoading ? (
            "Loading From Chain ..."
          ) : (
            <pre className="text-tiny">{JSON.stringify(votes, null, 2)}</pre>
          )}
        </div>
        <div className="w-1/2">
          <p>Latest user vote Polkassembly: </p>
          {isPALoading ? (
            "Loading PA ..."
          ) : (
            <pre className="text-tiny">{JSON.stringify(paVotes, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
