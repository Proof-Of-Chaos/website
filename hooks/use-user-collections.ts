import { DEFAULT_CHAIN } from "@/config/chains";
import { useQuery } from "react-query";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { encodeAddress } from "@polkadot/keyring";

export const useUserCollections = () => {
  const {
    activeChainName,
    activeChainInfo,
    apiStates: { assetHub },
  } = usePolkadotApis();
  const chainName = activeChainName || DEFAULT_CHAIN;
  const api = assetHub?.api;

  const { ss58Format } = activeChainInfo || {};
  const { selectedAccount } = usePolkadotExtension();
  const userAddress =
    selectedAccount?.address && ss58Format
      ? encodeAddress(selectedAccount?.address, ss58Format)
      : "";

  return useQuery({
    queryKey: ["userCollections", chainName, userAddress],
    enabled: !!api,
    queryFn: async () => {
      const allCollections = await api?.query.nfts.collection.entries();
      return allCollections
        ?.map(([key, value]) => ({
          collectionId: key.args[0].toString(),
          collection: value.toJSON() as { owner: string; items: number },
        }))
        .filter(({ collection }) => collection?.["owner"] === userAddress)
        .sort((a, b) => parseInt(b.collectionId) - parseInt(a.collectionId));
    },
  });
};
