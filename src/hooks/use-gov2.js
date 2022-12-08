import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery } from "@tanstack/react-query";
import { websiteConfig } from "../data/website-config";
import { getApi } from '../data/chain';
import { GET_GOV2_REF_TITLE_AND_CONTENT } from "./queries";
import { microToKSM } from '../utils';

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
        index: parseInt(key.args[0].toHuman()),
        tally: {
          ayes: parseInt(ayes),
          nays: parseInt(nays),
          support: parseInt(support),
        },
        voted_amount_aye: microToKSM( parseInt(ayes) ),
        voted_amount_nay: microToKSM( parseInt(nays) ),
        voted_amount_total: microToKSM( parseInt(ayes) + parseInt(nays) ),
        //todo this wil change
        ended_at: null,
        ends_at: refjson.ongoing.enactment?.after,
      }
    } else {
      return referendum.toJSON()
    }
  } );

  //all ref ids in array of strings
  const indexes = gov2refs.map( ref => ref.index )
  const notnullids = indexes.filter( index => typeof index !== 'undefined' )

  //attach title and content fields to each ref from polkassembly refDetails
  let refDetails = await getTitleAndContentForRefs( notnullids );
  const merged = gov2refs.map(
    ref => {
      return Object.assign(ref, refDetails.find(
        refDetail => {
          return parseInt(refDetail.onchain_link.onchain_referendumv2_id) === ref.index
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


async function issuanceFetcher () {
  const api = await getApi();
  const totalIssuance = await api.query.balances.totalIssuance();

  return totalIssuance
}

export const useIssuance = () => {
  return useQuery(["active-issuance"], issuanceFetcher);
}