import { useBreakpoint } from '../../hooks/use-breakpoint'
import { useIsMounted } from '../../hooks/use-is-mounted';
import { useCollectionData } from '../../hooks/use-collection-data';
import {nftFeedData} from "../../data/nft-feed-data";

export function NftFeed({
  id,
  name,
  symbol,
  balance,
  usdBalance,
  change,
  isChangePositive,
  prices,
}) {

  return (
    <div className="flex items-center text-center gap-3 rounded-lg bg-white p-5 shadow-card dark:bg-light-dark">
      <div className="w-full flex-col">
        <div className="mb-3 flex items-center">
          <h4 className="text-sm w-full font-medium text-gray-900 rtl:mr-3 dark:text-white">
            {name}
          </h4>
        </div>

        <div className="mb-2 text-xl font-medium tracking-tighter text-gray-900 dark:text-white lg:text-2xl 2xl:text-3xl 3xl:text-4xl">
          {balance}
          <span className="">{symbol}</span>
        </div>
      </div>
    </div>
  );
}

export default function PriceFeedSlider({ priceFeeds }) {
  const isMounted = useIsMounted();
  const breakpoint = useBreakpoint();

  const { data, error } = useCollectionData()

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading statistics...</div>

  let [ totalNFTs, owners, volume ] = [0, 0, 0]

  data.forEach((collectionData) => {
    totalNFTs += collectionData.totalNFTs
    owners = Math.max(owners, collectionData.owners)
    volume += collectionData.volume.all
  })

  nftFeedData[0]['balance'] = totalNFTs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  nftFeedData[1]['balance'] = owners.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  nftFeedData[2]['balance'] = volume.toFixed(1) + ' KSM';

  const sliderBreakPoints = {
    500: {
      slidesPerView: 1.2,
      spaceBetween: 20,
    },
    640: {
      slidesPerView: 1.5,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 2.5,
      spaceBetween: 24,
    },
    1280: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    1440: {
      slidesPerView: 3.2,
      spaceBetween: 24,
    },
    1700: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
  };

  return isMounted &&
    ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].indexOf(breakpoint) !== -1 ? (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {priceFeeds.map((item) => (
          <NftFeed key={item.id} {...item} />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {priceFeeds.map((item) => (
          <NftFeed key={item.id} {...item} />
        ))}
      </div>
    );
}
