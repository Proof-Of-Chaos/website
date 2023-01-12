import { websiteConfig } from "../data/website-config";
import { request, gql } from "graphql-request";
import { QUERY_QUIZZES } from "./queries";
import { useQuery } from "@tanstack/react-query";

export async function fetchGov1Quizzes() {
  let where = {
    "where": {
      "governanceVersion_eq": 1
    }
  }

  let result = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    QUERY_QUIZZES,
    where,
  )

  return result.quizzes
}

export const useGov1Quizzes = () => {
  return useQuery(
    ["gov1quizzes"], fetchGov1Quizzes
  )
}

export async function quizFetcher(referendumIndex, gov2) {
  if (!referendumIndex) {
    return []
  }

  let where = {
    "where": {
      "referendumIndex_eq": referendumIndex,
      "governanceVersion_eq": gov2 ? 2 : 1,
    }
  }

  let result = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    QUERY_QUIZZES,
    where
  )

  return result.quizzes?.[0] ?? []
}

export const useLatestQuizForRef = (referendumIndex, gov2 = false) => {
  return useQuery(
    ["quiz", referendumIndex, gov2],
    async () => quizFetcher(referendumIndex, gov2)
  )
}
