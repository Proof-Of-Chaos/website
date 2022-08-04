import useSWR from "swr";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { websiteConfig } from "../../data/website-config"

export const nftsFetcher = async () => {
  return await fetchReferendums()
};

async function fetchReferendums() {
  let referendums = websiteConfig.classic_referendums;
  let results = await Promise.all(websiteConfig.referendum_rarities.map((rarity) => {
    return fetchNFTsForRarity(rarity);
  }));

  results.forEach((rarity) => {
    rarity.data.nfts.forEach((item) => {
      fetchThumb(item.priority[0]).then((thumb) => {
        let attr = item.metadata_properties;
        referendums.push({
          ref: item.metadata_name,
          rmrkId: item.id,
          thumb: thumb,
          amount: attr.total_supply.value,
          artist: attr.artist.value,
          rarity: attr.rarity.value,
          url: 'https://singular.app/collections/' + item.collectionId + '?search=' + encodeURIComponent(item.metadata_name),
        });
      });
    });
  })

  return referendums.sort((a, b) => {
    if (a.ref > b.ref){ return -1 } else if (a.ref < b.ref){ return 1 } else { return 0 } // sort by ref name
  });
}

async function fetchNFTsForRarity(rarity) {
  const client = new ApolloClient({
    uri: websiteConfig.singular_graphql_endpoint,
    cache: new InMemoryCache()
  });

  let data = await client.query({
    query: gql` 
            query PaginatedNftQuery(
                $where: nfts_bool_exp!
                $limit: Int!
                $offset: Int!
            ) {
                nfts(where: $where, order_by: {
                    metadata_name: desc 
                    updated_at: desc
                    sn: desc
                }, limit: $limit, offset: $offset, distinct_on: metadata_name) {
                    ...NFT
                }
            }
            fragment NFT on nfts {
                id
                collectionId
                metadata_name
                metadata_properties
                priority
            }
        `,
    variables:
        {
          "where": {
            "burned": {
              "_eq": ""
            },
            "collectionId": {
              "_in": [
                "3208723ec6f65df810-ITEM",
                "3208723ec6f65df810-ITEMXEVRLOOT",
                "3208723ec6f65df810-ITEMXRMRK",
                "3208723ec6f65df810-ITEMXMT"
              ]
            },
            "metadata_properties": {
              "_contains": {
                "rarity": {
                  "type": "string",
                  "value": rarity
                }
              }
            }
          },
          "limit": 10000,
          "offset": 0
        }
  });

  return data;
}

async function fetchThumb(firstResource) {
  const client = new ApolloClient({
    uri: websiteConfig.singular_graphql_endpoint,
    cache: new InMemoryCache()
  });

  let data = await client.query({
    operationName: "fetchResourceById",
    query: gql` 
        query fetchResourceById($resourceId: String!) {
          resources(where: {id: {_eq: $resourceId}, pending: {_eq: false}}, limit: 1) {
            thumb
          }
        }
    `,
    variables: {
      "resourceId": firstResource
    }
  });

  return data.data.resources[0].thumb.replace('ipfs://ipfs/', '');
}

export const useNfts = () => {
  const { data, mutate, error } = useSWR( 'nfts', nftsFetcher )
  const loading = !data && !error;

  return {
    loading,
    nfts: data,
    mutate,
    error,
  };
};