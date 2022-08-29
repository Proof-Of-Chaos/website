import { ApiPromise, WsProvider } from "@polkadot/api";
import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../zustand";

export default function useAccountBalance() {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const selectedAccount = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex] )
  return useQuery( ['accountBalance', connectedAccountIndex], async() => {
    const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    const { data, status } = await api.query.system.account( selectedAccount.address );
    return { data, status }
  })
}