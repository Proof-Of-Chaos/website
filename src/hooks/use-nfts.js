import { websiteConfig } from "../data/website-config"
import useAppStore from "../zustand";
import {
  useQuery,
} from "@tanstack/react-query";
import { request, gql } from "graphql-request";

import { GET_NFT_FLOOR, GET_REFERENDUM_NFTS } from "./queries";

async function fetchFloorNFT( symbol ) {
  if ( typeof symbol === 'undefined ') {
    return new Promise.resolve({ data: { nfts: [] } })
  }

  return request(
    websiteConfig.singular_graphql_endpoint,
    GET_NFT_FLOOR,
    {
      "where": {
        "collectionId": {
          "_in": [
            "3208723ec6f65df810-ITEM",
            "3208723ec6f65df810-ITEMXEVRLOOT",
            "3208723ec6f65df810-ITEMXRMRK",
            "3208723ec6f65df810-ITEMXMT",
            "3208723ec6f65df810-ITEMXPUNKS",
            "3208723ec6f65df810-ITEMXARCHIVERSE"
          ]
        },
        "burned": {
          "_eq": ""
        },
        "symbol": {
          "_eq": symbol
        },
        "forsale": {
          "_neq": 0
        }
      },
      "orderBy": [
        {
          "forsale": "asc"
        }
      ],
    }
  )
}

async function fetchNFTsForUser( address ) {
  return request(
    websiteConfig.singular_graphql_endpoint,
    gql`
      query UserNFTsQuery($where: nfts_bool_exp) {
        nfts(where: $where) {
          symbol,
          metadata,
          burned
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
          "_in": websiteConfig.singular_referendum_collections,
        },
        "burned": {
          "_eq": ""
        }
      }
    }
  )
}

async function fetchReferendumNFTsDistinct() {
  return await request(
    websiteConfig.singular_graphql_endpoint,
    GET_REFERENDUM_NFTS, { "where": {
      "burned": {
        "_eq": ""
      },
      "collectionId": {
        "_in": websiteConfig.singular_referendum_collections
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

      const regex = /\n+/;
      const descriptionSegments = item.metadata_description.split(regex);

      return {
        ref: item.metadata_name,
        symbol: item.symbol,
        rmrkId: item.id,
        thumb: item.resources[0].thumb.replace('ipfs://ipfs/', ''),
        amount: attr.total_supply?.value,
        artist: attr.artist?.value,
        rarity: attr.rarity?.value,
        title: descriptionSegments[0].replace(/'/g, ""),
        description: descriptionSegments[1] ?? item.metadata_description,
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

export const useNFTScores = () => {
  return useQuery(['NFTScores'], async () => {
    const data = await fetch( websiteConfig.proofofchaos_scores_endpoint )
    const scores = await data.json()
    return scores
  })
}

export const useFloorNFT = ( symbol ) => {
  return useQuery(['FloorNFT', symbol ], async () => {
    return await fetchFloorNFT( symbol )
  } )
}