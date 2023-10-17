import { DEFAULT_CHAIN } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { useQuery } from "react-query";

export const usePastReferendaIndices = () => {
  const { activeChainName } = usePolkadotApis();
  const chain = activeChainName || DEFAULT_CHAIN;

  return useQuery({
    queryKey: ["past-referenda", chain],
    queryFn: async () => {
      const res = await fetch(`/api/referenda/past?chain=${chain}`);
      const { pastReferenda } = await res.json();
      return pastReferenda;
    },
  });
};
