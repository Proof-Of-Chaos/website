import { useAppStore } from "@/app/zustand";
import { DEFAULT_CHAIN } from "@/config/chains";
import { DecoratedConvictionVote } from "@/types";
import { useQuery } from "react-query";
import { useSubstrateChain } from "../use-substrate-chain";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";

export const useLatestUserVotesIndexer = (referendaFilter: string) => {
  const { activeChainName } = usePolkadotApis();
  const chain = activeChainName || DEFAULT_CHAIN;
  const { selectedAccount } = usePolkadotExtension();
  const userAddress = selectedAccount?.address || "";

  console.log(
    "useLatestUserVote",
    activeChainName,
    userAddress,
    referendaFilter
  );

  return useQuery<DecoratedConvictionVote[]>({
    queryKey: ["userVotesIndexer", activeChainName, userAddress, referendaFilter],
    queryFn: async () => {
      const res = await fetch(`/api/vote-indexer`, {
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
