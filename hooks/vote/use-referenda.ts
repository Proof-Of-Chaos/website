import { useQuery } from "react-query";
import { UIReferendum, UITrack } from "@/app/[chain]/vote/types";
import { DEFAULT_CHAIN } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";

type UseReferendaType = {
  referenda: UIReferendum[];
  tracks: UITrack[];
};

export const useReferenda = (
  refFilter: string = "ongoing",
  withTracks = true
) => {
  const { activeChainName } = usePolkadotApis();
  const chain = activeChainName || DEFAULT_CHAIN;

  return useQuery({
    queryKey: ["referenda", chain, refFilter, withTracks],
    queryFn: async () => {
      const res = await fetch(`/api/referenda`, {
        method: "post",
        body: JSON.stringify({
          chain,
          refFilter,
          withTracks,
        }),
      });

      const { referenda, tracks } = (await res.json()) as UseReferendaType;
      return { referenda, tracks };
    },
  });
};
