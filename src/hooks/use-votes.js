import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { websiteConfig } from "../data/website-config";
import useAppStore from "../zustand";
import { QUERY_VOTES } from "./queries";

const voteFetcher = async ( ksmAddress ) => {
  const data = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    QUERY_VOTES,
    {
      "votesWhere": {
        "voter_eq": ksmAddress,
        "blockNumberRemoved_isNull": true //only latest votes
      },
    }
  );

  return data.votes
};

export const useVotes = ( ksmAddress, config = {} ) => {
  return useQuery( [ 'votes', ksmAddress ], async() => voteFetcher( ksmAddress ), config )
};

export const useUserVotes = () => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )
  return useVotes( ksmAddress, {
    enabled: !!ksmAddress,
  })
}
