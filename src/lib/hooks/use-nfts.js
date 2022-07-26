import useSWR from "swr";
import { allNfts } from "../../data/nfts-all"

// mock the quizzes api
const nftsFetcher = async () => {
  await new Promise(res => setTimeout(res, 1000));
  return allNfts
};

export const useNfts = () => {
  const { data, mutate, error } = useSWR( 'nfts', nftsFetcher )
  const loading = !data && !error;

  return {
    loading,
    nfts: data,
    mutate,
    error,
  };
};
