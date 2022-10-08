import { gql as agql } from '@apollo/client'

export const QUERY_PAST_REFERENDUMS = agql`
    query PastReferendums {
      referendums(where: {endedAt_isNull: false}, limit: 20, orderBy: index_DESC) {
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
    }
`