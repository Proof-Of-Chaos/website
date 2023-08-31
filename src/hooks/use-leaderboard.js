import { ApiPromise, WsProvider } from "@polkadot/api";
import { useQuery } from "@tanstack/react-query";
import { getApi, getApiKusama } from "../data/chain";
import { getEndDateByBlock } from "../utils/utils";

const ENDPOINT_RMRK_NFT_UPDATED_PREFIX =
  "https://singular.app/api/rmrk2/nft-updated/";
const ENDPOINT_RMRK_PRERENDER = "https://prerender.rmrk.link";

const ENDPOINT_SHELF_LEADERBOARD =
  "https://scores.proofofchaos.app/shelf/leaderboard";
const ENDPOINT_DRAGON_LEADERBOARD =
  "https://scores.proofofchaos.app/dragon/leaderboard";

const leaderboardFetcher = async () => {
  const data = await fetch(ENDPOINT_SHELF_LEADERBOARD);
  const ranking = await data.json();
  return ranking;
};

export const useLeaderboard = () => {
  return useQuery(["leaderboard"], leaderboardFetcher);
};

export const leaderboardShelfThumbnailFetcher = async (nftId) => {
  return new Promise(async (resolve, reject) => {
    // 1. get the timestring of the last update we need for the thumbnail prerender endpoint
    const data = await fetch(`${ENDPOINT_RMRK_NFT_UPDATED_PREFIX}${nftId}`);
    const res = await data.json();

    const updatedAt = new Date(res?.[0]?.updated_at).getTime();

    // 2. get the thumbnail of the composite NFT
    if (typeof updatedAt !== "undefined" && updatedAt > 0) {
      resolve(`${ENDPOINT_RMRK_PRERENDER}/${updatedAt}/${nftId}.jpg`);
    }

    reject("error fetching thumbnail");
  });
};

export const useShelfThumbnail = (nftId) => {
  return useQuery(["shelfThumbnail", nftId], () =>
    leaderboardShelfThumbnailFetcher(nftId)
  );
};

const dragonLeaderboardFetcher = async () => {
  const data = await fetch(ENDPOINT_DRAGON_LEADERBOARD);
  const ranking = await data.json();
  return ranking;
};

export const useDragonLeaderboard = () => {
  return useQuery(["draongLeaderboard"], dragonLeaderboardFetcher);
};

export const useLastLeaderboardUpdate = () => {
  const { data: leaderboard } = useLeaderboard();
  const leaderboardBlock = leaderboard?.block;

  return useQuery(
    ["leaderboard", leaderboardBlock],
    async () => {
      const api = await getApiKusama();
      const { number: currentBlockNumber } = await api.rpc.chain.getHeader();

      const lastUpdate = await getEndDateByBlock(
        leaderboardBlock,
        currentBlockNumber,
        Date.now()
      );
      return {
        lastUpdate,
        leaderboardBlock,
      };
    },
    {
      enabled: !!leaderboardBlock,
    }
  );
};
