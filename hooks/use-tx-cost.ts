import { RuntimeDispatchInfo } from "@polkadot/types/interfaces";

import { useAppStore } from "@/app/zustand";
import { TxTypes, getTxCost } from "@/components/util-client";
import { DEFAULT_CHAIN } from "@/config/chains";
import { ChainType } from "@/types";
import { useQuery } from "react-query";
import { Observable } from "rxjs";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";

type Type = RuntimeDispatchInfo | Observable<RuntimeDispatchInfo>;

export const useTxCost = (tx: TxTypes, chainType?: ChainType) => {
  const {
    activeChainName,
    apiStates: { relay, assetHub },
  } = usePolkadotApis();
  const chainName = activeChainName || DEFAULT_CHAIN;
  const { selectedAccount } = usePolkadotExtension();
  const address = selectedAccount?.address || "";

  const api = chainType === ChainType.AssetHub ? assetHub?.api : relay?.api;

  return useQuery<Type, Error>({
    queryKey: ["txCost", chainName, chainType, tx?.toString(), address],
    queryFn: async () => {
      const txCost = await getTxCost(api, tx, address);
      return txCost;
    },
  });
};
