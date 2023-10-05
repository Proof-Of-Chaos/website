import { useAppStore } from "@/app/zustand";
import { ApiPromise } from "@polkadot/api";
import { InjectedExtension } from "@polkadot/extension-inject/types";
import { useQuery } from "react-query";
import { encodeAddress } from "@polkadot/keyring";
import { ChainType } from "@/types";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export const useAccountBalance = (
  chainType: ChainType | undefined = ChainType.Relay
) => {
  const { activeChainName, activeChainInfo } = usePolkadotApis();
  const { ss58Format } = activeChainInfo || {};
  const user = useAppStore((state) => state.user);
  const { address } = user?.accounts?.[user.actingAccountIdx] || {};
  const userAddress = address && encodeAddress(address, ss58Format);

  return useQuery({
    queryKey: [activeChainName, address, "accountBalance"],
    enabled: !!activeChainName && !!address,
    queryFn: async () => {
      const res = await fetch(`/api/account-balance`, {
        method: "post",
        body: JSON.stringify({
          chain: activeChainName,
          address: userAddress,
          chainType,
        }),
      });
      const { balance } = await res.json();
      return balance;
    },
  });
};
