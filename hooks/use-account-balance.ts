import { useQuery } from "react-query";
import { ChainType } from "@/types";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";

export const useAccountBalance = (
  chainType: ChainType | undefined = "relay"
) => {
  const { activeChainName, activeChainInfo } = usePolkadotApis();

  const { selectedAccount } = usePolkadotExtension();
  const userAddress = selectedAccount?.address || "";

  return useQuery({
    queryKey: [activeChainName, userAddress, "accountBalance"],
    enabled: !!activeChainName && !!userAddress,
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
