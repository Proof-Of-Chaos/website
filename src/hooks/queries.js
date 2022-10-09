import { gql as agql } from '@apollo/client'

export const QUERY_REFERENDUMS = agql`
  query Referendums(
    $where: ReferendumWhereInput,
    $orderBy: [ReferendumOrderByInput!],
    $limit: Int,
    $votesOrderBy: [VoteOrderByInput!],
    $votesWhere: VoteWhereInput
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
      total_issuance
      vote_duration
      referendum_index
      threshold_type
      count_new
      count_total
      ended_at
    }
    votes(orderBy: $votesOrderBy, where: $votesWhere) {
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