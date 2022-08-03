import {ApolloClient, gql, InMemoryCache} from "@apollo/client";
import {websiteConfig} from "../../data/website-config";
import Image from "next/image";
import React, { useState, useEffect } from 'react'

function SingleNFT( { id, rarity, data: { thumb, firstResource, artist, amount } } ) {
    const [fetchedThumb, setFetchedThumb] = useState(thumb);

    useEffect(() => {
        if (!thumb && firstResource) {
            fetchThumb(firstResource);
        }
    }, []);

    const fetchThumb = async (firstResource) => {
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

        let thumb = data.data.resources[0] ? data.data.resources[0].thumb.replace('ipfs://ipfs/', '') : null;
        console.log(thumb)
        setFetchedThumb(thumb)
    }

    return (
        <div className="single-nft rounded-lg p-4 transform transition duration-200 hover:scale-105">
            <span className="font-bold block pb-2">{ rarity }</span>
            { fetchedThumb ?
                <Image
                    src={`https://gateway.ipfs.io/ipfs/${ fetchedThumb }`}
                    alt={ `GovRewards NFT for Referendum ${ id } of rarity common` }
                    width={ 200 }
                    height={ 200 }
                /> :
                <div className="error">No image found</div>
            }
            <div className="nft-artist break-all pt-2">artist: { artist }</div>
            <div className="nft-amount">amount: { amount }</div>
        </div>
    )
}

export default SingleNFT