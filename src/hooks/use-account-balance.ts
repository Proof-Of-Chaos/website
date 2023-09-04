import { ApiPromise, WsProvider } from "@polkadot/api";
import { useQuery } from "@tanstack/react-query";
import useAppStore from "../zustand";
import { getApiKusama, getApiKusamaAssetHub } from "../data/chain";
import { get } from "lodash";
import {
  FrameSystemAccountInfo,
  PalletAssetsAssetAccount,
} from "@polkadot/types/lookup";

export async function getAccountBalanceAssetHubKusama(accountAddress) {
  if (!accountAddress) {
    return;
  }
  const api = await getApiKusamaAssetHub();
  await api.isReady;

  console.log("getAccountBalanceAssetHubKusama", accountAddress);

  const { data } = await api.query.system.account<FrameSystemAccountInfo>(
    accountAddress
  );
  return { data };
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
      const { data } = await api.query.system.account<FrameSystemAccountInfo>(
        selectedAccount.address
      );
      return { data };
    },
  });
}

export function useKusamaAccountBalance() {
  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const selectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );

  return useQuery({
    queryKey: ["accountBalance", connectedAccountIndex],
    queryFn: async () => {
      const api = await getApiKusama();
      const { data } = await api.query.system.account<FrameSystemAccountInfo>(
        selectedAccount.address
      );
      return { data };
    },
  });
}
