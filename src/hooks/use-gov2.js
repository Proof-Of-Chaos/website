import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery } from "@tanstack/react-query";
import { websiteConfig } from "../data/website-config";
import { getApi } from '../data/chain';
import { GET_GOV2_REF_TITLE_AND_CONTENT } from "./queries";

export const gov2referendumFetcher = async () => {
  const api = await getApi();
  let gov2refs = await api.query.referenda.referendumInfoFor.entries()

  gov2refs = gov2refs.map( ([key, referendum]) => {
    let refjson = referendum.toJSON();

    if ( refjson.ongoing ) {
      let {
        tally: { ayes, nays, support },
      } = refjson.ongoing;
      return {
        ...refjson.ongoing,
        id: parseInt(key.args[0].toHuman()),
        tally: {
          ayes: parseInt(ayes),
          nays: parseInt(nays),
          support: parseInt(support),
        },
      }
    } else {
      return referendum.toJSON()
    }
  } );

  //all ref ids in array of strings
  const ids = gov2refs.map( ref => ref.id )
  const notnullids = ids.filter( id => typeof id !== 'undefined' )

  //attach title and content fields to each ref from polkassembly refDetails
  let refDetails = await getTitleAndContentForRefs( notnullids );
  const merged = gov2refs.map(
    ref => {
      return Object.assign(ref, refDetails.find(
        refDetail => {
          return parseInt(refDetail.onchain_link.onchain_referendumv2_id) === ref.id
        }
      ))
    }
  )

  return merged
}

export const useGov2Referendums = () => {
  return useQuery(
    [ "gov2-referendums"],
    gov2referendumFetcher
  )
}

async function getTitleAndContentForRefs(referendumIDs) {
  return new Promise( async ( resolve ) => {
    const client = new ApolloClient({
      uri: websiteConfig.polkassembly_graphql_endpoint,
      cache: new InMemoryCache(),
    })

    let result = await client.query({
      operationName: "ReferendumPostAndComments",
      query: GET_GOV2_REF_TITLE_AND_CONTENT,
      variables: {
        "where": {
          "onchain_link": {
            "onchain_referendumv2_id": {
              "_in": referendumIDs
            }
          }
        }
      }
    })

    resolve(result?.data?.posts)
  })
}

export const useGov2Tracks = () => {
  return useQuery(["gov2-tracks"], async () => {
    const api = await getApi();
    const tracks = await api.consts.referenda.tracks.toHuman()
    return tracks
  });
}