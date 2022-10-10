import { gql as agql } from '@apollo/client'

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