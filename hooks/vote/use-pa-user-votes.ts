import { useAppStore } from "@/app/zustand";
import { DEFAULT_CHAIN } from "@/config/chains";
import { useSubstrateChain } from "@/context/substrate-chain-context";
import { SubstrateChain } from "@/types";
import { encodeAddress } from "@polkadot/keyring";
import { useQuery } from "react-query";

export const usePAUserVotes = () => {
  const user = useAppStore((s) => s.user);
  const { activeChain } = useSubstrateChain();
  const { ss58Format, name } = activeChain || {};
  const userAddress = user?.accounts?.[user.actingAccountIdx]?.address;
  const chainAddress = userAddress
    ? encodeAddress(userAddress, ss58Format)
    : userAddress;

  console.log(
    "Polkassembly: useLatestUserVote",
    activeChain?.name,
    userAddress
  );

  return useQuery({
    queryKey: ["PAuserVotes", activeChain?.name, userAddress],
    queryFn: async () => {
      const headers = new Headers();
      headers.append(
        "x-network",
        (activeChain?.name || SubstrateChain.Kusama).toLowerCase()
      );

      const requestOptions: RequestInit = {
        method: "GET",
        headers,
        redirect: "follow",
      };

      const res = await fetch(
        `https://api.polkassembly.io/api/v1/votes/history?page=1&listingLimit=100&voterAddress=${chainAddress}`,
        requestOptions
      );
      const votes = await res.json();
      return votes;
    },
  });
};
