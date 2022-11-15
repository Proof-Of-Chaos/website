import { gql as agql } from '@apollo/client'
import { websiteConfig } from '../data/website-config'

export const GET_REFERENDUM_NFTS = agql`
query PaginatedNFTQuery(
    $where: nfts_bool_exp, 
    $orderBy: [nfts_order_by!], 
    $distinctNftsDistinctOn2: [nfts_select_column!]
) {
    nfts(
        where: $where, 
        order_by: $orderBy, 
        distinct_on: $distinctNftsDistinctOn2
    ) {
      ...NFT
    }
}
  fragment NFT on nfts {
      id
      collectionId
      metadata_name
      metadata_properties
      metadata_description
      symbol
      resources {
        thumb
      }
  }
`

export const GET_NFT_FLOOR = agql`
query Referendums($where: nfts_bool_exp, $orderBy: [nfts_order_by!], $limit: Int) {
  nfts(where: $where, order_by: $orderBy, limit: $limit) {
    symbol
    burned
    forsale
    properties
  }
}
`

export const QUERY_REFERENDUMS = agql`
  query Referendums(
    $where: ReferendumWhereInput,
    $orderBy: [ReferendumOrderByInput!],
    $limit: Int
  ) {
    referendums(where: $where, orderBy: $orderBy, limit: $limit) {
      index
    }
    referendaStats {
      count_aye
      count_nay
      index
      passed_at
      not_passed_at
      executed_at
      cancelled_at
      voted_amount_aye
      voted_amount_nay
      voted_amount_total
      total_issuance
      vote_duration
      referendum_index
      threshold_type
      count_new
      count_total
      ended_at
      ends_at
      status
    }
  }
`

export const QUERY_VOTES = agql`
  query Votes(
    $votesWhere: VoteWhereInput
  ) {
    votes(where: $votesWhere) {
      voter
      referendumIndex
      balance {
        ... on SplitVoteBalance {
          aye
          nay
        }
        ... on StandardVoteBalance {
          value
        }
      }
      decision
      lockPeriod
    }
  }
`

/**
 * query configs, accept where with index
 * {
  "where": {
    "referendumIndex_eq": null
}
 */
export const QUERY_CONFIG = agql`
  query Configs($where: ConfigWhereInput) {
    configs(
      orderBy: timestamp_DESC,
      where: $where
    ) {
      referendumIndex
      blockNumber
      timestamp
      minValue
      minAmount
      maxValue
      median
      seed
      babyBonus
      toddlerBonus
      adolescentBonus
      adultBonus
      options {
        minProbability
        sweetspotProbability
        rarity
        configId
        id
        maxProbability
        resources(orderBy: id_DESC) {
          id
          itemName
          thumbCid
          metadataCidDirect
          metadataCidDelegated
        }
      }
    }
  }
`

/**
 * expects
 *     {
      "where": {
        "referendumIndex_eq": refIndex,
        "wallet_eq": wallet
      }
    }
 */
export const QUERY_DISTRIBUTIONS = agql`
  query Distributions($where: DistributionWhereInput) {
    distributions(
      where: $where
      orderBy: distributionVersion_DESC
    ) {
      wallet
      distributionVersion
      referendumIndex
      amountConsidered
      dragonEquipped
      chancesAtItems
      indexItemReceived
    }
  }
`
