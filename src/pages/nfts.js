import Layout from '../layouts/layout'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

import { websiteConfig } from '../data/website-config'
import NFTDetail from '../components/nft/nft-detail'

function PageNFTs({ referendums }) {
  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">
      { referendums.map( nft => <NFTDetail key={ nft.id } nft={ nft } /> ) }
      <pre className="text-red-500 text-center">... implement a fetch to get more NFTs ...</pre>
      <pre className="text-red-500 text-center">pages/nfts.js</pre>
    </section>
  )
}

PageNFTs.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
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
                "limit": 1000000,
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
                base_id
                id
                src
                slot_id
                metadata
                thumb
                theme
                pending
                replace
                base {
                  type
                  parts(limit: 1) {
                    part_id
                  }
                }
                base_theme {
                  theme {
                    theme_color_1
                    theme_color_2
                    theme_color_3
                    theme_color_4
                  }
                }
              }
            }

        `,
        variables: {
            "resourceId": firstResource
        }
    });

    return data.data.resources[0].thumb.replace('ipfs://ipfs/', '');
}

export async function getStaticProps() {
    let referendums = websiteConfig.classic_referendums;
    let results = await Promise.all(websiteConfig.referendum_rarities.map((rarity) => {
        return fetchNFTsForRarity(rarity);
    }));

    results.forEach((rarity) => {
        rarity.data.nfts.forEach((item) => {
            let matchingReferendumIndex = referendums.findIndex((ref) => ref.id === item.metadata_name);

            if (matchingReferendumIndex < 0) {
                referendums.push({
                    id: item.metadata_name,
                });
                matchingReferendumIndex = referendums.length - 1;
            }

            let attr = item.metadata_properties;
            referendums[matchingReferendumIndex][attr.rarity.value] = {
                rmrkId: item.id,
                thumb: null,
                firstResource: item.priority[0],
                amount: attr.total_supply.value,
                artist: attr.artist.value,
            }
        });
    })

    referendums.sort((a, b) => {
        if (a.id > b.id){
            return -1
        } else if (a.id < b.id){
            return 1
        } else {
            return 0
        }
    });

    return {
        props: {
            referendums: referendums
        }
    }
}

export default PageNFTs
