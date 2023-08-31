import { ApiPromise } from "@polkadot/api";
import { useQuery } from "@tanstack/react-query";

export const useNftCollection = (collectionId: number, api: ApiPromise) => {
  return useQuery({
    queryKey: ["nftCollection", collectionId],
    queryFn: async () => {
      const collection = await api.query.nfts.collection(collectionId);
      return collection;
    },
  });
};
