import { websiteConfig } from "../../data/website-config"
import useAppStore from "../../zustand";
import {
  useQuery,
} from "@tanstack/react-query";
import { request, gql } from "graphql-request";

async function fetchNFTsForUser( address ) {
  return request(
    websiteConfig.singular_graphql_endpoint,
    gql`
      query UserNFTsQuery($where: nfts_bool_exp) {
        nfts(where: $where) {
          symbol,
          metadata,
          resources {
            thumb
          }
        }
      }
    `,
    {
      "where": {
        "rootowner": {
          "_eq": address,
        },
        "collectionId": {
          "_in": [
            "3208723ec6f65df810-ITEM",
            "3208723ec6f65df810-ITEMXEVRLOOT",
            "3208723ec6f65df810-ITEMXRMRK",
            "3208723ec6f65df810-ITEMXMT",
            "3208723ec6f65df810-ITEMXPUNKS",
        ],
        }
      }
    }
  )
}

const GET_REFERENDUM_NFTS = gql`
query PaginatedNFTQuery(
    $where: nfts_bool_exp, 
    $orderBy: [nfts_order_by!], 
    $distinctNftsDistinctOn2: [nfts_select_column!]
) {
    nfts(
        where: $where, 
        order_by: $orderBy, 
        distinct_on: $distinctNftsDistinctOn2
    ) {
      ...NFT
    }
}
  fragment NFT on nfts {
      id
      collectionId
      metadata_name
      metadata_properties
      priority
      symbol
      resources {
        thumb
      }
  }
`

async function fetchReferendumNFTsDistinct() {
  return await request(
    websiteConfig.singular_graphql_endpoint,
    GET_REFERENDUM_NFTS, { "where": {
      "burned": {
        "_eq": ""
      },
      "collectionId": {
        "_in": [
          "3208723ec6f65df810-ITEM",
          "3208723ec6f65df810-ITEMXEVRLOOT",
          "3208723ec6f65df810-ITEMXRMRK",
          "3208723ec6f65df810-ITEMXMT",
          "3208723ec6f65df810-ITEMXPUNKS",
        ]
      },
      "metadata_properties": {
        "_contains": {
          "rarity": {
            "type": "string",
          }
        }
      }
    },
    "orderBy": [
      {
        "metadata": "desc",
        "symbol": "desc",
      }
    ],
    "distinctNftsDistinctOn2": [
      "metadata", 
      "symbol"
    ],
  }
  )
}

export function useNFTs( queryOptions ) {
  return useQuery(["NFTs"], async () => {
    const { nfts } = await fetchReferendumNFTsDistinct()
    const transformedNFTs = await Promise.all(nfts.map( async ( item ) => {
      let attr = item.metadata_properties;
      return {
        ref: item.metadata_name,
        symbol: item.symbol,
        rmrkId: item.id,
        thumb: item.resources[0].thumb.replace('ipfs://ipfs/', ''),
        amount: attr.total_supply?.value,
        artist: attr.artist?.value,
        rarity: attr.rarity?.value,
        url: 'https://singular.app/collections/' + item.collectionId + '?search=' + encodeURIComponent(item.metadata_name),
      }
    }));
    return [ ...transformedNFTs, ...websiteConfig.classic_referendums ]
  }, queryOptions)
}

export const useUserNfts = () => {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const connectedAccount = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex] )
  const ksmAddress = connectedAccount?.ksmAddress

  return useQuery(["userNFTs", ksmAddress ], async () => {
    if ( typeof ksmAddress === 'undefined') {
      return []
    }

    const data = await fetchNFTsForUser( ksmAddress );
    return data.nfts
  })
}