import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery } from "@tanstack/react-query";
import { websiteConfig } from "../data/website-config";
import { getApi } from '../data/chain';
import { GET_GOV2_REF_TITLE_AND_CONTENT } from "./queries";
import { microToKSM } from '../utils';
import { useMemo } from 'react';
import { BN_ZERO } from '@polkadot/util';
import { isNull, some } from 'lodash';

// Inspired by and simplified from subsquare and polkadot.js
// https://github.com/opensquare-network/subsquare/tree/83a1a03a72aac36220c28e088ffe10621458be9a/packages/next-common/context/post/gov2
// https://github.com/polkadot-js/apps/tree/master/packages/page-referenda/src

export const gov2referendumFetcher = async ( refId ) => {
  const api = await getApi();
  let gov2refs;

  if ( typeof refId === 'undefined' ) {
    return [];
  }

  if (refId === 'all') {
    gov2refs = await api.query.referenda.referendumInfoFor.entries()
  } else if ( isFinite(refId) ) {
    gov2refs = await api.query.referenda.referendumInfoFor(refId)
    gov2refs = [[refId, gov2refs]]
  } else {
    return [];
  }


  gov2refs = gov2refs.map( ([key, referendum]) => {
    let refjson = referendum.toJSON();
    try {
      if ( refjson.ongoing ) {
        let {
          tally: { ayes, nays, support },
        } = refjson.ongoing;
        return {
          ...refjson.ongoing,
          gov2: true,
          index: key?.args?.[0] ? parseInt(key.args[0].toHuman()) : parseInt(refId),
          tally: {
            ayes: parseInt(ayes),
            nays: parseInt(nays),
            support: support,
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
    } catch( e ) {
      console.error( e )
    }
  } );

  //all ref ids in array of strings
  const indexes = gov2refs.map( ref => ref.index )
  const notnullids = indexes.filter( index => typeof index !== 'undefined' )

  //attach title and content fields to each ref from polkassembly refDetails
  let refDetails = await getTitleAndContentForRefs( notnullids );
  const merged = gov2refs.map(
    ref => {
      const polkassemblyRef = refDetails.find(
        refDetail => {
          return parseInt(refDetail.post_id) === ref.index
        }
      )
      return Object.assign(ref, {
        title: polkassemblyRef?.title,
        content: polkassemblyRef?.content
      })
    }
  )

  const onlyActiveRefs = merged.filter( ref => typeof ref.index !== 'undefined' && ! some([ref.approved, ref.rejected, ref.cancelled]))
  return onlyActiveRefs.sort( (a,b) => a.index - b.index )
}

export const useGov2Referendums = () => {
  return useQuery(
    ["gov2-referendums"],
    async () => gov2referendumFetcher('all')
  )
}

export const useGov2Referendum = (referendumId) => {
  return useQuery(
    ["gov2-referendum", referendumId],
    async () => gov2referendumFetcher(referendumId)
  )
}

// async function getTitleAndContentForRefs(referendumIDs) {
//   return new Promise( async ( resolve ) => {
//     const client = new ApolloClient({
//       uri: websiteConfig.polkassembly_graphql_endpoint,
//       cache: new InMemoryCache(),
//     })

//     let result = await client.query({
//       operationName: "ReferendumPostAndComments",
//       query: GET_GOV2_REF_TITLE_AND_CONTENT,
//       variables: {
//         "where": {
//           "onchain_link": {
//             "onchain_referendumv2_id": {
//               "_in": referendumIDs
//             }
//           }
//         }
//       }
//     })

//     resolve(result?.data?.posts)
//   })
// }

async function getTitleAndContentForRefs( referendumIds ) {

  const promises = referendumIds.map( id => getTitleAndContentForRef( id ) )
  return Promise.all(promises).then((values) => {
    return values
  });
}

async function getTitleAndContentForRef( refId ) {
  return new Promise( async ( resolve, reject ) => {
    var myHeaders = new Headers();
    myHeaders.append("x-network", "kusama");
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch(`https://api.polkassembly.io/api/v1/posts/on-chain-post?proposalType=referendums_v2&postId=${refId}`, requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      .catch(error => reject(error));
  })
}

export const useGov2Tracks = () => {
  return useQuery(["gov2-tracks"], async () => {
    const api = await getApi();
    const tracks = await api.consts.referenda.tracks.toJSON()
    return tracks
  });
}


async function activeIssuanceFetcher () {
  const api = await getApi();
  const totalIssuance = await api.query.balances.totalIssuance()
  const inactiveIssuance = await api.query.balances.inactiveIssuance()
  const activeIssuance = totalIssuance && totalIssuance.sub(inactiveIssuance || BN_ZERO)
  return activeIssuance
}

export const useIssuance = () => {
  return useQuery(["active-issuance"], activeIssuanceFetcher);
}