import Button from "../ui/button";
import SingleNFT from "./single-nft";

export default function NFTDetail( { nft } ) {
  const { id } = nft;
  return (
    <div className="nft-detail mb-3 hover:shadow-lg shadow-sm flex flex-wrap justify-between rounded-lg bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6">
      <div className="flex flex-col justify-between lg:w-1/4 w-full">
        <span className="text-lg font-bold">{ id }</span>
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