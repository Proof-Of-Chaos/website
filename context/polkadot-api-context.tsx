"use client";

import { ChainConfig, ChainType, SubstrateChain } from "../types/index";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getChainInfo } from "@/config/chains";

export interface PolkadotApiState {
  api: ApiPromise | undefined;
  isConnected: boolean;
}

interface PolkadotApis {
  apiStates: {
    [key: string]: PolkadotApiState;
  };
  activeChainName: SubstrateChain;
  activeChainInfo: ChainConfig;
  switchChain: (chainName: SubstrateChain, apiName: string) => void;
}

const PolkadotApisContext = createContext<PolkadotApis | undefined>(undefined);

type PolkadotApiProviderProps = {
  children: React.ReactNode;
};

export const PolkadotApisProvider: React.FC<PolkadotApiProviderProps> = ({
  children,
}) => {
  const apisToActivate: ChainType[] = [ChainType.Relay, ChainType.AssetHub];

  const apiCache = useRef<Map<string, ApiPromise | undefined>>(new Map());

  const [apiStates, setApiStates] = useState<Record<string, PolkadotApiState>>(
    {}
  );

  const [activeChainName, setActiveChainName] = useState<SubstrateChain>(
    SubstrateChain.Kusama
  );

  const activeChainInfo = useMemo(
    () => getChainInfo(activeChainName),
    [activeChainName]
  );

  const initializeApis = async () => {
    let newApis: Record<string, PolkadotApiState> = {};
    for (const apiName of apisToActivate) {
      const cacheKey = `${activeChainName}:${apiName}`;

      setApiStates((prev) => ({
        ...prev,
        [apiName]: {
          ...prev[apiName],
          isConnected: false,
        },
      }));

      if (apiCache.current.has(cacheKey)) {
        const cachedApi = apiCache.current.get(cacheKey);
        if (cachedApi) {
          newApis[apiName] = {
            api: cachedApi,
            isConnected: true,
          };
        }
      } else {
        const apiEndpoints = activeChainInfo.endpoints[apiName];

        if (!apiEndpoints) {
          throw new Error(
            `No endpoints found for ${apiName} on ${activeChainName}. Activate them in your chain config`
          );
        }

        const endpointUrls = apiEndpoints.map((endpoint) => endpoint.url);
        const provider = new WsProvider(endpointUrls);
        const api = await ApiPromise.create({ provider });
        await api.isReady;
        apiCache.current.set(cacheKey, api);

        newApis[apiName] = {
          api,
          isConnected: true,
        };
      }

      setApiStates((prev) => ({
        ...prev,
        ...newApis,
      }));
    }
  };

  useEffect(() => {
    initializeApis();
  }, [activeChainName]);

  const switchChain = (newChainName: SubstrateChain) => {
    setActiveChainName(newChainName);
  };

  return (
    <PolkadotApisContext.Provider
      value={{
        apiStates,
        activeChainInfo,
        activeChainName,
        switchChain,
      }}
    >
      {children}
    </PolkadotApisContext.Provider>
  );
};

export const usePolkadotApis = (): PolkadotApis => {
  const context = useContext(PolkadotApisContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
