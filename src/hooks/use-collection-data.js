import { useQuery } from "@tanstack/react-query";
import { websiteConfig } from "../data/website-config";

const getAllCollectionData = async () => {
  const collectionCalls = websiteConfig.singular_referendum_collections.map(
    (collection) => {
      return fetch(
        "https://singular.app/api/stats/collection/" +
          collection +
          "?rmrk2Only=false"
      );
    }
  );
  const collectionData = await Promise.all(collectionCalls);
  const collectionJson = await Promise.all(collectionData.map((r) => r.json()));
  return collectionJson;
};

export const useCollectionData = () => {
  return useQuery(["collectionData"], getAllCollectionData);
};
