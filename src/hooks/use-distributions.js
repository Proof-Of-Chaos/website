import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { websiteConfig } from "../data/website-config";
import useAppStore from "../zustand";
import { QUERY_DISTRIBUTIONS } from "./queries";

const distributionsFetcher = async ( wallet, refIndex ) => {
  const data = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    QUERY_DISTRIBUTIONS,
    {
      "where": {
        "referendumIndex_eq": refIndex,
        "wallet_eq": wallet,
      }
    }
  );

  return data.distributions
};

export const useDistributions = ( wallet, refIndex, queryConfig = {} ) => {
  return useQuery( ['distributions', wallet, refIndex], async() => distributionsFetcher( wallet, refIndex ), queryConfig )
};

export const useUserDistributions = ( refIndex, queryConfig = {} ) => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )

  return useDistributions( ksmAddress, refIndex, {
    ...queryConfig,
    enabled: !!ksmAddress,
  })
}
