// import { WsProvider } from "@polkadot/api";
// import { useEffect, useState } from "react";

// // Custom hook for managing endpoint and WsProvider
// export const useEndpointManager = (
//   chainName: string | undefined,
//   apiName: string | undefined,
//   endpointsMap: Map<string, string[]>
// ) => {
//   if (!chainName || !apiName) throw new Error("Missing chain or api name");

//   const [endpointIndex, setEndpointIndex] = useState(0);
//   const currentKey = `${chainName}:${apiName}`;
//   const currentEndpoint = endpointsMap.get(currentKey)?.[endpointIndex];

//   const [provider, setProvider] = useState<WsProvider | undefined>(undefined);

//   useEffect(() => {
//     const wsProvider = new WsProvider(currentEndpoint);

//     const unsubscribe = wsProvider.on("disconnected", () => {
//       const newIndex =
//         (endpointIndex + 1) % (endpointsMap.get(currentKey)?.length || 1);
//       setEndpointIndex(newIndex);
//     });

//     setProvider(wsProvider);

//     return () => {
//       unsubscribe();
//       wsProvider.disconnect();
//     };
//   }, [chainName, apiName, endpointIndex, currentEndpoint]);

//   return { currentEndpoint, provider };
// };
