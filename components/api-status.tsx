"use client";

import React, { useEffect } from "react";
import { ApiPromise } from "@polkadot/api";
import { set } from "lodash";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { SubstrateChain } from "@/types";
import { Button } from "@nextui-org/button";
import { formatBalance } from "@polkadot/util";
import { getChainInfo } from "@/config/chains";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { InlineLoader } from "./inline-loader";

export const ApiStatus: React.FC = () => {
  const {
    apiStates: { relay, assetHub },
    switchChain,
    activeChainName,
  } = usePolkadotApis();

  const { selectedAccount } = usePolkadotExtension();
  const [freeBalanceRelay, setFreeBalanceRelay] = React.useState<string>("0");
  const [freeBalanceAssetHub, setFreeBalanceAssetHub] =
    React.useState<string>("0");
  const activeChainInfo = getChainInfo(activeChainName);

  const address = selectedAccount?.address || "";

  useEffect(() => {
    const asyncEffect = async (api: ApiPromise | undefined) => {
      if (api) {
        const { data: balance } = (await api?.query?.system?.account(
          address
        )) || {
          data: { free: "0" },
        };
        if (balance.free.toString() !== "0") {
          const freeBalance = formatBalance(balance.free, {
            decimals: activeChainInfo.decimals,
            forceUnit: "-",
            withSi: true,
            withUnit: activeChainInfo.symbol,
          });
          setFreeBalanceRelay(freeBalance);
        } else {
          setFreeBalanceRelay("0");
        }
      }
    };
    asyncEffect(relay?.api);
  }, [relay, address]);

  useEffect(() => {
    const asyncEffect = async (api: ApiPromise | undefined) => {
      if (api) {
        const { data: balance } = (await api?.query?.system?.account(
          address
        )) || {
          data: { free: "0" },
        };
        if (balance.free.toString() !== "0") {
          const freeBalance = formatBalance(balance.free, {
            decimals: activeChainInfo.decimals,
            forceUnit: "-",
            withSi: true,
            withUnit: activeChainInfo.symbol,
          });
          setFreeBalanceAssetHub(freeBalance);
        } else {
          setFreeBalanceAssetHub("0");
        }
      }
    };
    asyncEffect(assetHub?.api);
  }, [assetHub, address]);

  return (
    <div className="flex gap-4 flex-col">
      Active Chain: {activeChainName}
      <div className="flex gap-4">
        <Button
          color="secondary"
          isDisabled={activeChainName === SubstrateChain.Kusama}
          onClick={() => switchChain(SubstrateChain.Kusama, "relay")}
        >
          Switch to Kusama
        </Button>
        <Button
          color="secondary"
          isDisabled={activeChainName === SubstrateChain.Polkadot}
          onClick={() => switchChain(SubstrateChain.Polkadot, "relay")}
        >
          Switch to Polkadot
        </Button>
      </div>
      <div>
        Api: Relay
        <h3>
          Free Balance:{" "}
          {relay?.isConnected ? freeBalanceRelay : <InlineLoader />}
        </h3>
        <h3>
          Api Status:{" "}
          {relay?.isConnected ? (
            <div className="p-1 rounded-full w-2 h-2 animate-pulse inline-block bg-green-500"></div>
          ) : (
            <div className="p-1 rounded-full w-2 h-2 animate-pulse inline-block bg-red-500"></div>
          )}
        </h3>
      </div>
      <div>
        Api: AssetHub
        <h3>
          Free Balance:{" "}
          {assetHub?.isConnected ? freeBalanceAssetHub : <InlineLoader />}
        </h3>
        <h3>
          Api Status:{" "}
          {assetHub?.isConnected ? (
            <div className="p-1 rounded-full w-2 h-2 animate-pulse inline-block bg-green-500"></div>
          ) : (
            <div className="p-1 rounded-full w-2 h-2 animate-pulse inline-block bg-red-500"></div>
          )}
        </h3>
      </div>
    </div>
  );
};