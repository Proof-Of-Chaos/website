import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { QUERY_CONFIG } from "./queries";

const ENDPOINT_POC_INDEXER = 'https://squid.subsquid.io/referenda-dashboard/v/0/graphql'

const configFetcher = async ( refIndex ) => {
  const data = await request(
    ENDPOINT_POC_INDEXER,
    QUERY_CONFIG,
    {
      "where": {
        "referendumIndex_eq": refIndex
      }
    }
  );

  return data.configs
};

export const useConfig = ( refIndex, queryConfig = {} ) => {
  return useQuery( ['config', refIndex], async() => configFetcher( refIndex ), queryConfig )
};
