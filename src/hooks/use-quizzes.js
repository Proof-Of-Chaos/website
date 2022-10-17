import {websiteConfig} from "../data/website-config";
import { request, gql } from "graphql-request";

export async function getQuizDataForRef(referendumIndex) {
  return request(
    websiteConfig.proofofchaos_graphql_endpoint,
    gql`query QuizzesQuery {
      quizzes(where: {referendumIndex_eq: ${referendumIndex}}) {
        blockNumber
        creator
        id
        referendumIndex
        timestamp
        version
        questions {
          id
          quizId
          text
          indexCorrectAnswerHistory {
            blockNumber
            correctIndex
            id
            questionId
            submitter
            timestamp
            version
          }
          answerOptions {
            id
            questionId
            text
          }
        }
        submissions {
          answers {
            id
          }
          blockNumber
          id
          quizId
          referendumIndex
          timestamp
          version
          wallet
        }
      }
    }
    `
  )
}
