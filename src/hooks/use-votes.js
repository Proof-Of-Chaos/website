import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { isNaN } from "lodash";
import { websiteConfig } from "../data/website-config";
import useAppStore from "../zustand";
import { QUERY_CONVICTION_VOTES, QUERY_USER_VOTE_FOR_REF, QUERY_VOTES } from "./queries";

const voteFetcher = async ( ksmAddress, gov2=false ) => {
  let votes_query = gov2 ? QUERY_CONVICTION_VOTES : QUERY_VOTES

  let where = {
    "where": {
      "voter_eq": ksmAddress,
      "blockNumberRemoved_isNull": true, //only latest votes
    },
  }

  const data = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    votes_query,
    where
  );

  return gov2 ? data.convictionVotes : data.votes
};

export const useVotes = ( ksmAddress, gov2 = false, config = {}, select ) => {
  return useQuery({
    queryKey: [ 'votes', ksmAddress, gov2 ],
    queryFn: async() => voteFetcher( ksmAddress, gov2 ),
    config,
    select,
  })
};

export const useUserVotes = (gov2=false) => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )
  return useVotes(
    ksmAddress,
    gov2,
    {
      enabled: !!ksmAddress,
    },
    (data) => data.filter( (vote) => vote.voter === ksmAddress )
  )
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

  return data.votes[0] ?? null
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
  return useVotes(
    ksmAddress,
    true, //gov2
    {
      enabled: !!ksmAddress,
    },
    (data) => data.find( ( vote ) => vote.voter === ksmAddress && vote.referendumIndex === referendumIndex)
  )
}
