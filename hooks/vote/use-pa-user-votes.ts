import { useAppStore } from "@/app/zustand";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { SubstrateChain } from "@/types";
import { encodeAddress } from "@polkadot/keyring";
import { useQuery } from "react-query";

export const usePAUserVotes = () => {
  const user = useAppStore((s) => s.user);
  const { activeChainName, activeChainInfo } = usePolkadotApis();
  const { ss58Format, name } = activeChainInfo || {};
  const userAddress = user?.accounts?.[user.actingAccountIdx]?.address;
  const chainAddress = userAddress
    ? encodeAddress(userAddress, ss58Format)
    : userAddress;

  console.log("Polkassembly: useLatestUserVote", activeChainName, userAddress);

  return useQuery({
    queryKey: ["PAuserVotes", activeChainName, userAddress],
    queryFn: async () => {
      const headers = new Headers();
      headers.append(
        "x-network",
        (activeChainName || SubstrateChain.Kusama).toLowerCase()
      );

      const requestOptions: RequestInit = {
        method: "GET",
        headers,
        redirect: "follow",
      };

      const res = await fetch(
        `https://api.polkassembly.io/api/v1/votes/history?page=1&listingLimit=100&voterAddress=${chainAddress}&voteType=referendums_v2`,
        requestOptions
      );
      const votes = await res.json();
      return votes;
    },
  });
};
