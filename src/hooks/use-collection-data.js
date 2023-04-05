import { useQuery } from '@tanstack/react-query';
import {websiteConfig} from "../data/website-config";

const getAllCollectionData = async () => {
  const collectionCalls = websiteConfig.singular_referendum_collections.map((collection) => {
    return fetch('https://singular.app/api/stats/collection/' + collection + '?rmrk2Only=false')
  })
  const collectionData = await Promise.all(collectionCalls)
  return await Promise.all(collectionData.map(r => r.json()))
};

export const useCollectionData = () => {
  return useQuery( ['collectionData'], getAllCollectionData )
};
