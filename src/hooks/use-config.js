import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { websiteConfig } from "../data/website-config";
import { QUERY_CONFIG } from "./queries";

const configFetcher = async ( refIndex ) => {
  const data = await request(
    websiteConfig.proofofchaos_graphql_endpoint,
    QUERY_CONFIG,
    {
      "where": {
        "referendumIndex_eq": parseInt( refIndex )
      }
    }
  );

  //only return the latest config
  return data.configs[0] ?? null
};

export const useConfig = ( refIndex, queryConfig = {} ) => {
  return useQuery( ['config', refIndex], async() => configFetcher( refIndex ), queryConfig )
};
