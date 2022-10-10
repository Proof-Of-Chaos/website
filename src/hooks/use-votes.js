import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import useAppStore from "../zustand";
import { QUERY_VOTES } from "./queries";

const ENDPOINT_POC_INDEXER = 'https://squid.subsquid.io/referenda-dashboard/v/1/graphql'

const voteFetcher = async ( ksmAddress ) => {
  const data = await request(
    ENDPOINT_POC_INDEXER,
    QUERY_VOTES,
    {
      "votesWhere": {
        "voter_eq": ksmAddress
      },
    }
  );

  return data.votes
};

export const useVotes = ( ksmAddress, config = {} ) => {
  return useQuery( ['votes'], async() => voteFetcher( ksmAddress ), config )
};

export const useUserVotes = () => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )
  return useVotes( ksmAddress, {
    enabled: !!ksmAddress,
  })
}
