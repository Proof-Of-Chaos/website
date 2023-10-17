// "server only";

// import NodeCache from "node-cache";
// import { ApiPromise, WsProvider } from "@polkadot/api";

// // Set up the cache with a default TTL of 1 hour (3600 seconds)
// const apiPromiseCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// async function getApiForUser(
//   userId: string,
//   apiName: string
// ): Promise<ApiPromise> {
//   const cacheKey = `${userId}-${apiName}`;
//   let api: ApiPromise | undefined = apiPromiseCache.get(cacheKey);

//   if (!api) {
//     const provider = new WsProvider("wss://your-endpoint.com");
//     api = await ApiPromise.create({ provider });
//     apiPromiseCache.set(cacheKey, api);
//   }

//   return api;
// }

// export { getApiForUser };
