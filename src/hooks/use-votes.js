import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { websiteConfig } from "../data/website-config";
import useAppStore from "../zustand";
import { QUERY_USER_VOTE_FOR_REF, QUERY_VOTES } from "./queries";

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

const singleVoteFetcher = async ( ksmAddress, referendumIndex ) => {
  const data = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    QUERY_USER_VOTE_FOR_REF,
    {
      "where": {
        "referendumIndex_eq": parseInt( referendumIndex ),
        "voter_eq": ksmAddress
      },
      "orderBy": "timestamp_DESC"
    }
  );

  return data.votes[0]
}

/**
 * Get the latest vote for ksmAddress and refeerndumIndex
 * @param { String } ksmAddress
 * @param { String } referendumIndex
 */
export const useLatestVoteForUserAndRef = ( ksmAddress, referendumIndex ) => {
  return useQuery(
    [ 'vote', ksmAddress, referendumIndex ],
    async () => singleVoteFetcher( ksmAddress, referendumIndex ),
    {
      enabled: !!ksmAddress
    }
  )
}

/**
 * Get the latest vote for the current user and refeerndumIndex
 * @param { String } referendumIndex
 */
export const useLatestUserVoteForRef = ( referendumIndex ) => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )
  return useQuery(
    [ 'vote', ksmAddress, referendumIndex ],
    async () => singleVoteFetcher( ksmAddress, referendumIndex ),
    {
      enabled: !!ksmAddress
    }
  )
}
