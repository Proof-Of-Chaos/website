import { getChainByName } from "@/config/chains";
import { ChainConfig, SubstrateChain } from "@/types";
import { useQuery } from "react-query";

export const useSubstrateChain = (chain: SubstrateChain) => {
  return useQuery<ChainConfig, Error>({
    queryKey: ["substrateChain", chain],
    queryFn: async () => {
      const chainConfig = await getChainByName(chain);
      return chainConfig;
    },
  });
};
