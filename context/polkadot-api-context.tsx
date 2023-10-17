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
import { ApiCache } from "@/config/chains/ApiCache";
import { usePathname } from "next/navigation";

export interface PolkadotApiState {
  api: ApiPromise | undefined;
  endpoint?: string;
  isConnected: boolean;
}

interface PolkadotApis {
  apiStates: Record<ChainType, PolkadotApiState | undefined> | undefined;
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
  const pathname = usePathname();
  const selectedChain = Object.values(SubstrateChain).find((substrateChain) =>
    pathname.includes(`/${substrateChain}/`)
  );

  const [activeChainName, setActiveChainName] = useState<SubstrateChain>(
    selectedChain || SubstrateChain.Kusama
  );

  const apisToActivate: ChainType[] = ["relay", "assetHub"];

  const activeChainInfo = useMemo(
    () => getChainInfo(activeChainName),
    [activeChainName]
  );

  const [apiStates, setApiStates] = useState<
    Record<ChainType, PolkadotApiState | undefined>
  >({
    relay: {
      api: undefined,
      isConnected: false,
    },
    assetHub: {
      api: undefined,
      isConnected: false,
    },
    bridgeHub: {
      api: undefined,
      isConnected: false,
    },
  });

  useEffect(() => {
    console.log("switching chain to ", activeChainName);
    setApiStates((prev) => ({
      ...prev,
      relay: {
        ...prev.relay,
        api: undefined,
        isConnected: false,
      },
      assetHub: {
        ...prev.assetHub,
        api: undefined,
        isConnected: false,
      },
      bridgeHub: {
        ...prev.bridgeHub,
        api: undefined,
        isConnected: false,
      },
    }));
    (async () => {
      const apis = await ApiCache.getApis(activeChainName);
      await Promise.all(
        apisToActivate.map(async (apiName) => {
          const apiContainer = apis[apiName];
          if (apiContainer?.api) {
            await apiContainer?.api?.isReady;
            setApiStates((prev) => ({
              ...prev,
              [apiName]: {
                apiContainer,
                isConnected: true,
              },
            }));
          }
        })
      );

      setApiStates((prev) => ({
        ...prev,
        ...apis,
      }));
    })();
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
