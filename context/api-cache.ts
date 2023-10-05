// import { ApiPromise, WsProvider } from "@polkadot/api";
// import { endpointsMap } from "./endpoints"; // Importing the const
// import { type } from "os";

// export type ApiData = {
//   api: ApiPromise;
//   endpoint: string;
//   provider: WsProvider;
// };

// export class ApiCache {
//   private static cache = new Map<
//     string,
//     Map<
//       string,
//       {
//         wsProvider: WsProvider;
//         apiPromise: ApiPromise;
//         handlers: { connectedUnsub: Function; disconnectedUnsub: Function };
//         endpoint: string;
//       }
//     >
//   >();
//   private static lastChainName: string | null = null;
//   private static endpointIndices = new Map<string, number>();

//   static async get(chainName: string, apiName: string): Promise<ApiData> {
//     const key = `${chainName}:${apiName}`;
//     const endpoints = endpointsMap.get(key);
//     if (!endpoints) throw new Error(`No endpoints found for ${key}`);

//     const endpointIndex = this.endpointIndices.get(key) || 0;
//     const endpoint = endpoints[endpointIndex];

//     // if (this.lastChainName && this.lastChainName !== chainName) {
//     //   this.disconnectAllForChain(this.lastChainName);
//     // }

//     this.lastChainName = chainName;

//     let apiMap = this.cache.get(chainName);

//     if (!apiMap) {
//       apiMap = new Map<
//         string,
//         {
//           wsProvider: WsProvider;
//           apiPromise: ApiPromise;
//           handlers: { connectedUnsub: Function; disconnectedUnsub: Function };
//           endpoint: string;
//         }
//       >();
//       this.cache.set(chainName, apiMap);
//     }

//     if (apiMap.has(apiName)) {
//       const apiData = apiMap.get(apiName)!;
//       if (apiData.endpoint !== endpoint) {
//         this.disconnect(chainName, apiName);
//       } else {
//         const { apiPromise, wsProvider } = apiData;
//         console.log(
//           `[${chainName}][${apiName}] ♻️ api already in cache: ${endpoint}`
//         );
//         return { api: apiPromise, endpoint, provider: wsProvider };
//       }
//     }

//     const wsProvider = new WsProvider(endpoint);

//     const connectedUnsub = wsProvider.on("connected", () => {
//       console.log(`[${chainName}][${apiName}] ✅ Connected to ${endpoint}`);
//     });

//     const disconnectedUnsub = wsProvider.on("disconnected", () => {
//       console.log(
//         `[${chainName}][${apiName}] ❌ Disconnected from ${endpoint}`
//       );
//       this.disconnect(chainName, apiName);
//     });

//     const apiPromise = await ApiPromise.create({ provider: wsProvider });

//     apiMap.set(apiName, {
//       wsProvider,
//       apiPromise,
//       handlers: {
//         connectedUnsub,
//         disconnectedUnsub,
//       },
//       endpoint,
//     });

//     return { api: apiPromise, endpoint, provider: wsProvider };
//   }

//   static incrementEndpointIndex(chainName: string, apiName: string): void {
//     const key = `${chainName}:${apiName}`;
//     const endpoints = endpointsMap.get(key);
//     if (!endpoints) throw new Error(`No endpoints found for ${key}`);

//     let endpointIndex = this.endpointIndices.get(key) || 0;
//     endpointIndex = (endpointIndex + 1) % endpoints.length;
//     this.endpointIndices.set(key, endpointIndex);

//     const apiMap = this.cache.get(chainName);
//     if (apiMap && apiMap.has(apiName)) {
//       this.disconnect(chainName, apiName);
//     }
//   }

//   private static disconnect(chainName: string, apiName: string): void {
//     const apiMap = this.cache.get(chainName);
//     if (!apiMap) return;

//     const apiData = apiMap.get(apiName);
//     if (apiData) {
//       apiData.handlers.connectedUnsub();
//       apiData.handlers.disconnectedUnsub();
//       apiData.wsProvider.disconnect();
//       apiMap.delete(apiName);
//     }
//   }

//   private static disconnectAllForChain(chainName: string): void {
//     const apiMap = this.cache.get(chainName);
//     if (!apiMap) return;

//     for (const apiName of Array.from(apiMap.keys())) {
//       this.disconnect(chainName, apiName);
//     }
//     this.cache.delete(chainName);
//   }
// }
