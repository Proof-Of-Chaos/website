import { useQuery } from "@tanstack/react-query";
import { getApiKusamaAssetHub, getNFTCollectionDeposit } from "../data/chain";
import { formatBalance } from "@polkadot/util";

export const useCollectionDeposit = () => {
  return useQuery(["collection-deposit"], async () => {
    const apiKusamaAssetHub = await getApiKusamaAssetHub();
    const collectionDeposit = await getNFTCollectionDeposit(apiKusamaAssetHub);
    return formatBalance(collectionDeposit, {
      forceUnit: "-",
      //Todo make decimals dynamic
      decimals: 12,
      withSi: true,
      withUnit: "KSM",
    });
  });
};
