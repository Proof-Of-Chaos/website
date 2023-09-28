import { useAppStore } from "@/app/zustand";
import { DEFAULT_CHAIN } from "@/config/chains";
import { useSubstrateChain } from "@/context/substrate-chain-context";
import { DecoratedConvictionVote } from "@/types";
import { useQuery } from "react-query";

export const useLatestUserVotes = (referendaFilter: string) => {
  const user = useAppStore((s) => s.user);
  const { activeChain } = useSubstrateChain();
  const chain = activeChain?.name || DEFAULT_CHAIN;
  const userAddress = user?.accounts?.[user.actingAccountIdx]?.address;

  console.log(
    "useLatestUserVote",
    activeChain?.name,
    userAddress,
    referendaFilter
  );

  return useQuery<DecoratedConvictionVote[]>({
    queryKey: ["userVotes", activeChain?.name, userAddress, referendaFilter],
    queryFn: async () => {
      const res = await fetch(`/api/vote`, {
        method: "post",
        body: JSON.stringify({
          chain,
          userAddress,
          referendaFilter,
        }),
      });

      const vote = await res.json();
      return vote;
    },
  });
};
