import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { uniqBy, every } from "lodash";
import Image from "../ui/image-fade"
import { useUserNfts } from "../../lib/hooks/use-nfts";
import Button from "../ui/button";
import {websiteConfig} from "../../data/website-config";

const isOwned = (ref, userNFTs, symbol, rarity) => {
  const refIndex = parseInt(ref.match(/Referendum ([0-9]+)/)[1])
  const userNFTSymbols = userNFTs?.map( ( { symbol } ) => symbol )

  if (refIndex >= 192) {

    return userNFTSymbols?.includes(symbol)
  } else if ([188, 190].includes(refIndex)) {

    const referendumConfig = websiteConfig.classic_referendums.find(referendum => referendum.ref === ref && referendum.rarity === rarity)
    const userNFTResources = [];
    userNFTs?.forEach((n) => {
      n.resources.forEach((r) => {
        userNFTResources.push(r.thumb)
      })
    })
    return referendumConfig.thumbs ? referendumConfig.thumbs.some(r => userNFTResources.includes(r)) : false
  } else {

    const userNFTMetadata = userNFTs?.map( ( { metadata } ) => metadata ) ?? []
    const referendumConfig = websiteConfig.classic_referendums.find(referendum => referendum.ref === ref && referendum.rarity === rarity)
    return referendumConfig.resources ? referendumConfig.resources.some(r => userNFTMetadata.includes(r)) : false
  }
}

function SingleNFT( { nft: { ref, rarity, thumb, artist, amount, symbol } } ) {
  const { data: userNFTs } = useUserNfts()

  return (
    <div className="single-nft relative p-4 transform transition duration-200 hover:scale-105 flex justify-center flex-col items-center">
      <div>
        { isOwned(ref, userNFTs, symbol, rarity) && <span className={ `absolute z-10 px-2 -ml-4 mt-5 nft-owned` }><FontAwesomeIcon icon={ faWallet } size={"sm"} /> owned</span>}
        <span className={ `absolute z-10 -ml-4 -mt-3 px-2 nft-${rarity}` }>{ rarity }</span>
        { thumb && thumb !== '' ?
          <Image
            src={`https://ipfs.rmrk.link/ipfs/${ thumb }`}
            alt={ `GovRewards NFT for Referendum ${ ref } of rarity ${ rarity }` }
            width={ 400 }
            height={ 400 }
          /> :
          <div className="error">No image found</div>
        }
      </div>
      <div className="nft-artist break-all pt-2">artist: { artist }</div>
      <div className="nft-amount">amount: { amount }</div>
    </div>
  )
}

export default function NFTDetail( { nfts } ) {
  //we receive not always 3 nfts, sometimes there are more or less
  const distinctUserNFTs = uniqBy( nfts, 'rarity' )

  const totalAmount =
    every(distinctUserNFTs, (nft)=>isFinite(nft.amount)) &&
    distinctUserNFTs?.reduce((acc,cur) => {
    let ret = 0;
    isFinite( cur.amount ) ? ret = acc + parseInt(cur.amount) : ret = acc
    return ret
  }, 0)

  return (
    <div className="nft-detail mx-4 mb-4 p-6 pb-10 border-b-2 transition-shadow duration-200 dark:bg-light-dark">
      <h3 className="text-4xl font-bold pb-4">{ nfts[0].ref }</h3>
      <div className="flex flex-wrap justify-between">
        { [ 'common', 'rare', 'epic', 'legendary' ].map( (rarity, idx) => {
          let nftByRarity = distinctUserNFTs.find( nft => nft?.rarity === rarity )

          if ( nftByRarity ) {
            return (
              <div
                key={ `${nftByRarity.ref}-${nftByRarity.rarity} `}
                className={ classNames(
                  'flex flex-col justify-between items-center w-full', {
                    'lg:w-1/4 md:w-1/3': distinctUserNFTs.length <= 3,
                    'lg:w-1/5 md:w-1/4': distinctUserNFTs.length === 4,
                  })}
                >
                <SingleNFT
                  id={ nftByRarity.ref }
                  nft={ nftByRarity }
                />
              </div>
            )
          }

          return
            ( <div key={ rarity }>Loading</div> )

        })}
        <div className={ classNames(
          'flex flex-col justify-between items-center w-full', {
            'lg:w-1/4': distinctUserNFTs.length <= 3,
            'lg:w-1/5': distinctUserNFTs.length === 4,
          }
        )}>
          <div className="flex flex-col items-center">
            { totalAmount && <>
              <p className="text-gray-700">Total NFTs sent</p>
              <h4 className="text-3xl font-bold">{ totalAmount }</h4>
            </>}
          </div>
            <a
                href={nfts[0].url}
                target="_blank"
                rel="noreferrer"
                className="no-underline"
            >
              <Button
                className="border-2 text-gray-800 w-full no-underline"
              >
                Get on
                <svg className="pl-3 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 693.24 169.09">
                  <path
                    d="M131.63.38H112.18a1.34,1.34,0,0,0-1.34,1.34h0V21.17a1.34,1.34,0,0,0,1.34,1.34h19.45A1.34,1.34,0,0,0,133,21.17V1.72A1.34,1.34,0,0,0,131.63.38Zm-6.8,38.52H112.18a1.34,1.34,0,0,0-1.34,1.34h0V73.1H97.91v38.13H87a33,33,0,0,0,.76-7V98.87C86.8,83.44,75.49,73.19,59,73.19H40.24a6,6,0,0,1-5.66-6.32,6.32,6.32,0,0,1,6-6.6h47a8.15,8.15,0,0,0,8.15-8.14V40.24a1.34,1.34,0,0,0-1.35-1.34H41c-16.47,0-27.78,10.25-28.74,25.67v4A32.65,32.65,0,0,0,12.84,73H0C2.68,85.93,13.32,94.27,28.17,94.27H57.1c4,0,8.52,1.82,8.52,7.76a8.7,8.7,0,0,1-8.32,9.09H21.56a8.15,8.15,0,0,0-8.15,8.14v11.79a1.34,1.34,0,0,0,1.34,1.34h55c15.52,0,27.12-8.14,30.18-21.27h10.92v13.13A8.15,8.15,0,0,0,119,132.4h12.64a1.34,1.34,0,0,0,1.34-1.34V111.13H120.14v-38H133V47a8.13,8.13,0,0,0-8.14-8.14Zm417.31,0H501a1.34,1.34,0,0,0-1.34,1.34h0V52a8.13,8.13,0,0,0,8.14,8.14h34.39c6.23,0,8.43,4.31,8.43,8.24v4.7H509.19c-18.2,0-33,8.24-33,28.83a39.29,39.29,0,0,0,1,9.3H490c3.16,14.17,13.79,21.17,28.35,21.17h19.55c5.94,0,12.36-5.08,12.36-10v3.84c0,4.79,3.35,6.13,5.94,6.13h14.94a1.34,1.34,0,0,0,1.34-1.34h0V111.23H559.68V73.1h12.83V68.21C572.61,50.68,560.35,38.9,542.14,38.9Zm-4.59,63.9a8.44,8.44,0,0,1-8.15,8.43H506.7c-4.51,0-8.15-4.31-8.15-8.43s2.59-8.44,8.15-8.44h30.85Zm114.1-63.9H627.12c-11.11,0-17,8-17,15V43.69a4.51,4.51,0,0,0-4.21-4.79H589.57a1.34,1.34,0,0,0-1.35,1.34h0V73.1H575.39v38.13h13v13.12a8.13,8.13,0,0,0,8.14,8.14h12.65a1.34,1.34,0,0,0,1.34-1.34h0V111.23H597.71V73.1h12.84V71.28a10.82,10.82,0,0,1,10.82-10.83h23.47A8.14,8.14,0,0,0,653,52.31V40.24a1.34,1.34,0,0,0-1.34-1.34Zm-212.88-.2H426.13A8.15,8.15,0,0,0,418,46.85V73.1H405.15V103a8.35,8.35,0,0,1-8.43,8.24H371.81a8.24,8.24,0,0,1-8.24-8.24h0V73.1h12.84V46.85a8.15,8.15,0,0,0-8.15-8.15H355.62a1.34,1.34,0,0,0-1.34,1.35V73.1H341.44V102a28.77,28.77,0,0,0,1.44,9.2h12.83a30.46,30.46,0,0,0,29,21.26h24.91a30.56,30.56,0,0,0,29.22-21.26H426a29.34,29.34,0,0,0,1.44-9.2V73.1h12.84v-33A1.64,1.64,0,0,0,438.77,38.7Zm-101.26.2H320.65a4,4,0,0,0-4,4h0c-4.7-4-9.58-4-12.94-4H281.08c-18.2,0-30.46,12-30.46,29.69V73.1H238.07V69.36A30.47,30.47,0,0,0,207.6,38.9H186.43c-6.13,0-13.51,4.21-14.47,10.25h-.19V47a8.13,8.13,0,0,0-8.14-8.14H151.37A1.34,1.34,0,0,0,150,40.24V73.1H137.19v38.13H150v19.92a1.34,1.34,0,0,0,1.34,1.34h19.45a1.34,1.34,0,0,0,1.34-1.34V111.23H159.32V73.1h12.84V71.28A11.11,11.11,0,0,1,183,60.16h21.94A10.83,10.83,0,0,1,215.75,71h0V73.1H202.91v38.13h12.84v13.12a8.13,8.13,0,0,0,8.14,8.14h12.65a1.34,1.34,0,0,0,1.34-1.34V111.32H225V73.1h12.74V102a35.75,35.75,0,0,0,1.15,9.2h12.84c3.35,13,13.79,21.26,28.26,21.26h26.54a17.81,17.81,0,0,0,10.15-3.35v10.25a8.24,8.24,0,0,1-8.24,8.24H264.89a8.15,8.15,0,0,0-8.14,8.14v12a1.34,1.34,0,0,0,1.34,1.34h50.3a30.46,30.46,0,0,0,30.46-30.46v-27.4H326V73.1h12.84V40.24a1.23,1.23,0,0,0-1.14-1.34ZM316.72,73.1H303.88v30a8.14,8.14,0,0,1-8.14,8.15H268.25a8.15,8.15,0,0,1-8.15-8.15h0v-30h12.84V68.31a8.15,8.15,0,0,1,8.14-8.15h27.5a8.14,8.14,0,0,1,8.14,8.15Zm147,0h12.84v-65A8.15,8.15,0,0,0,468.38,0H455.73a1.34,1.34,0,0,0-1.34,1.34V73.1H441.55v38.13h12.84v13.12a8.13,8.13,0,0,0,8.14,8.14h12.65a1.34,1.34,0,0,0,1.34-1.34V111.23H463.68Z"
                    fill="#eb3089"></path>
                </svg>
              </Button>
            </a>
        </div>
      </div>
    </div>
  )
}