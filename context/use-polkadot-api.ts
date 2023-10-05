// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   useMemo,
// } from "react";
// import { ApiPromise, WsProvider } from "@polkadot/api";
// import { getChainInfo } from "@/config/chains";

// import { ChainConfig, SubstrateChain } from "../types/index";
// import { PolkadotApiContextType } from "./polkadot-api-context";

// export function usePolkadotApi(apiName: string): PolkadotApiState {
//   const initialApi = apiName;

//   const [api, setApi] = useState<ApiPromise | undefined>(undefined);

//   const [isConnected, setIsConnected] = useState<boolean>(false);

//   const initializeApi = async () => {
//     setIsConnected(false);

//     const endpoints = activeChainInfo.endpoints;
//     if (!endpoints) throw new Error(`No endpoints provided for ${cacheKey}`);

//     if (apiCache.current.has(cacheKey)) {
//       const cachedApi = apiCache.current.get(cacheKey);
//       setApi(cachedApi);
//       setIsConnected(cachedApi?.isConnected || false);
//       return;
//     }

//     const endpointUrls = endpoints.map((endpoint) => endpoint.url);
//     const provider = new WsProvider(endpointUrls);
//     const apiInstance = await ApiPromise.create({ provider });
//     await apiInstance.isReady;
//     setIsConnected(apiInstance.isConnected);

//     setApi(apiInstance);
//     apiCache.current.set(cacheKey, apiInstance);
//   };

//   useEffect(() => {
//     initializeApi();
//   }, [cacheKey]);

//   useEffect(() => {
//     return () => {
//       apiCache.current.forEach(
//         (apiInstance) => apiInstance && apiInstance.disconnect()
//       );
//     };
//   }, []);

//   return {
//     api,
//     isConnected,
//   };
// }
