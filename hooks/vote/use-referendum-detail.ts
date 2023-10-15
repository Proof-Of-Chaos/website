import { useQuery } from "react-query";
import { getTitleAndContentForRef } from "@/app/[chain]/vote/util";
import { DEFAULT_CHAIN } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { SubstrateChain } from "@/types";

export const useReferendumDetail = (refId: string) => {
  const { activeChainName } = usePolkadotApis();

  // when rococo is active, we need to use kusama to query
  const chainName =
    activeChainName === SubstrateChain.Rococo
      ? SubstrateChain.Kusama
      : activeChainName || DEFAULT_CHAIN;

  return useQuery({
    queryKey: ["referendumDetail", refId, chainName],
    queryFn: async () => {
      const polkassemblyRef = await getTitleAndContentForRef(refId, chainName);

      const { title, content, requested } = polkassemblyRef;
      return { title, content, requested };
    },
  });
};
