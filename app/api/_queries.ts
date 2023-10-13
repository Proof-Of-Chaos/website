import { gql as agql } from '@apollo/client'

export const INDEXER_HEALTH = agql`
    query MyQuery {
        _metadata {
        lastProcessedHeight
        indexerHealthy
        }
    }
  `

export const QUERY_USER_VOTES = agql`
  query UserVotesQuery($filterCastingVote: CastingVotingFilter, $filterDelegatorVote: DelegatorVotingFilter) {
    _metadata {
      lastProcessedHeight
      indexerHealthy
    }
    castingVotings(
      orderBy: REFERENDUM_ID_ASC,
      filter: $filterCastingVote
    ) {
      nodes {
        referendumId
        standardVote
        splitVote
        splitAbstainVote
        referendum {
          trackId
        }
      }
    }
    delegatorVotings(
      filter: $filterDelegatorVote
    ) {
      nodes {
        vote
        parent {
            referendumId
            voter
            standardVote
            splitVote
            splitAbstainVote
            referendum {
              trackId
              finished
            }
        }
      }
    }
  }
`;
