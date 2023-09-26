import { useAppStore } from "@/app/zustand";
import { DEFAULT_CHAIN } from "@/config/chains";
import { useSubstrateChain } from "@/context/substrate-chain-context";
import { useQuery } from "react-query";

export const useLatestUserVote = (refIndex: string) => {
  const user = useAppStore((s) => s.user);
  const { activeChain } = useSubstrateChain();
  const chain = activeChain?.name || DEFAULT_CHAIN;
  const userAddress = user?.accounts?.[user.actingAccountIdx]?.address;

  console.log("useLatestUserVote", activeChain?.name, userAddress, refIndex);

  return useQuery({
    queryKey: ["userVotes", activeChain?.name, userAddress, refIndex],
    queryFn: async () => {
      const res = await fetch(`/api/vote`, {
        method: "post",
        body: JSON.stringify({
          chain,
          userAddress,
          refIndex,
        }),
      });

      const vote = await res.json();
      return vote;
    },
  });
};
