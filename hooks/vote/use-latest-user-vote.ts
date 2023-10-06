import { useAppStore } from "@/app/zustand";
import { DEFAULT_CHAIN } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { DecoratedConvictionVote, UserVotesReturnType } from "@/types";
import { useQuery } from "react-query";

export const useLatestUserVotes = (referendaFilter: string) => {
  const { activeChainName } = usePolkadotApis();
  const chain = activeChainName || DEFAULT_CHAIN;
  const { selectedAccount } = usePolkadotExtension();
  const userAddress = selectedAccount?.address || "";

  return useQuery<UserVotesReturnType>({
    queryKey: ["userVotes", activeChainName, userAddress, referendaFilter],
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

// useLatestUserVote kusama 5GstZ2VggLiFGgFFWkXzAjGypUgdUidqqjdv9t96PTx69RJV ongoing
