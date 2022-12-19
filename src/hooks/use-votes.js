import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { isNaN } from "lodash";
import { websiteConfig } from "../data/website-config";
import useAppStore from "../zustand";
import { QUERY_CONVICTION_VOTES, QUERY_USER_VOTE_FOR_REF, QUERY_VOTES } from "./queries";

const voteFetcher = async ( ksmAddress, referendumIndex=null, gov2=false ) => {
  let votes_query = gov2 ? QUERY_CONVICTION_VOTES : QUERY_VOTES

  let where = {
    "where": {
      "voter_eq": ksmAddress,
      "blockNumberRemoved_isNull": true, //only latest votes
      ...( referendumIndex && { "referendumIndex_eq": parseInt(referendumIndex) } )
    },
  }

  const data = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    votes_query,
    where
  );

  return gov2 ? data.convictionVotes : data.votes
};

export const useVotes = ( ksmAddress, referendumIndex = null, gov2 = false, config = {} ) => {
  console.log( 'useVotes', 'ksmAddress', ksmAddress, 'refIdx', referendumIndex, 'gov2', gov2 )
  return useQuery( [ 'votes', ksmAddress, referendumIndex, gov2 ], async() => voteFetcher( ksmAddress, referendumIndex, gov2 ), config )
};

export const useUserVotes = (referendumIndex = null, gov2=false) => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )
  return useVotes( ksmAddress, referendumIndex, gov2, {
    enabled: !!ksmAddress,
  })
}

const singleVoteFetcher = async ( ksmAddress, referendumIndex, gov2 = false ) => {
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
