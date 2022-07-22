import Image from "next/image"
import Button from "../ui/button";

function SingleNFT( { id, rarity, data: { thumb, artist, amount } } ) {
  return (
    <div className="single-nft rounded-lg p-4 transform transition duration-200 hover:scale-105">
      <span className="font-bold block pb-2">{ rarity }</span>
      { thumb && thumb !== '' ?
        <Image
          src={`https://gateway.ipfs.io/ipfs/${ thumb }`}
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

export default function NFTDetail( { nft } ) {
  const { id } = nft;
  return (
    <div className="nft-detail mb-3 hover:shadow-lg shadow-sm flex flex-wrap justify-between rounded-lg bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6">
      <div className="flex flex-col justify-between lg:w-1/4 w-full">
        <span className="text-lg font-bold">Referendum { id }</span>
        <span className="text-orange-600 mt-5">here could be statistics</span>
        <Button className="bg-brand-600 bg-opacity-25 w-44" variant="calm">
          Get on Singular
        </Button>
      </div>
      { [ 'common', 'rare', 'epic' ].map( rarity => (
        <div key={ `${id}-${rarity} `} className={ `nft-detail-${rarity} w-full lg:w-1/4 md:w-1/3` }>
          <SingleNFT
            id={ id }
            data={ nft[ rarity ] }
            rarity={ rarity }
          />
        </div>
      ))}
    </div>
  )
}