import { DEFAULT_CHAIN } from "@/config/chains";
import { ChainType } from "@/types";
import { useQuery } from "react-query";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export enum Deposit {
  Collection = "collectionDeposit",
  Item = "itemDeposit",
  Metadata = "metadataDeposit",
  Attribute = "attributeDeposit",
}

export interface UseDepositsType extends Record<Deposit, string | undefined> {
  collectionDeposit: string | undefined;
  itemDeposit: string | undefined;
  metadataDeposit: string | undefined;
  attributeDeposit: string | undefined;
}

export const useDeposits = (
  chainType: ChainType | undefined = ChainType.Relay
) => {
  const {
    activeChainName,
    apiStates: { relay, assetHub },
  } = usePolkadotApis();
  const chainName = activeChainName || DEFAULT_CHAIN;

  const api =
    chainType === ChainType.AssetHub
      ? assetHub?.api
      : relay?.api || assetHub?.api;

  return useQuery<UseDepositsType, Error>({
    queryKey: ["deposits", chainName, chainType],
    queryFn: async () => {
      const [
        collectionDeposit,
        itemDeposit,
        metadataDeposit,
        attributeDeposit,
      ] = await Promise.all([
        api?.consts.nfts?.collectionDeposit.toString(),
        api?.consts.nfts?.itemDeposit.toString(),
        api?.consts.nfts?.metadataDepositBase.toString(),
        api?.consts.nfts?.attributeDepositBase.toString(),
      ]);

      return {
        collectionDeposit,
        itemDeposit,
        metadataDeposit,
        attributeDeposit,
      };
    },
  });
};
