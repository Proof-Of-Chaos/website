import { useQuery } from "react-query";
import { getTitleAndContentForRef } from "@/app/[chain]/vote/util";
import { DEFAULT_CHAIN } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export const useReferendumDetail = (refId: string) => {
  const { activeChainName } = usePolkadotApis();
  const chainName = activeChainName || DEFAULT_CHAIN;

  return useQuery({
    queryKey: ["referendumDetail", refId, chainName],
    queryFn: async () => {
      const polkassemblyRef = await getTitleAndContentForRef(refId, chainName);

      const { title, content, requested } = polkassemblyRef;
      return { title, content, requested };
    },
  });
};

// const getEndDateByBlock = (
//   blockNumber,
//   currentBlockNumber,
//   currentTimestamp
// ) => {
//   let newStamp =
//     parseInt(currentTimestamp.toString()) +
//     (parseInt(blockNumber.toString()) - currentBlockNumber.toNumber()) *
//       BLOCK_DURATION;
//   return new Date(newStamp);
// };
