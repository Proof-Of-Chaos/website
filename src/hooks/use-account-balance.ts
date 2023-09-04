import { ApiPromise, WsProvider } from "@polkadot/api";
import { useQuery } from "@tanstack/react-query";
import useAppStore from "../zustand";
import { getApiKusama, getApiKusamaAssetHub } from "../data/chain";
import { get } from "lodash";

export function useKusamaAccountBalance() {
  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );

  return useQuery({
    queryKey: ["accountBalanceKusama", connectedAccountIndex],
    queryFn: async () => {
      const apiKusama = await getApiKusama();
      return useAccountBalance(apiKusama);
    },
  });
}

export async function getAccountBalanceAssetHubKusama(accountAddress) {
  if (!accountAddress) {
    return;
  }
  const api = await getApiKusamaAssetHub();
  await api.isReady;

  console.log("getAccountBalanceAssetHubKusama", accountAddress);

  const { data, status } = await api.query.system.account(accountAddress);
  return { data, status };
}

export function useAccountBalance(api: ApiPromise) {
  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const selectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );
  return useQuery({
    queryKey: ["accountBalance", connectedAccountIndex],
    queryFn: async () => {
      const { data, status } = await api.query.system.account(
        selectedAccount.address
      );
      return { data, status };
    },
  });
}
