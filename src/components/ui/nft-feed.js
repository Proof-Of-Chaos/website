import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useBreakpoint } from '../../lib/hooks/use-breakpoint'
import { useIsMounted } from '../../lib/hooks/use-is-mounted';
import useSWR from 'swr';
import {nftFeedData} from "../../data/nft-feed-data";

const fetcher = (...args) => fetch(...args).then((res) => res.json())

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
    <div className="flex items-center text-left gap-3 rounded-lg bg-white p-5 shadow-card dark:bg-light-dark">
      <div className="w-full flex-col">
        <div className="mb-3 flex items-center">
          <h4 className="text-sm font-medium text-gray-900 rtl:mr-3 dark:text-white">
            {name}
          </h4>
        </div>

        <div className="mb-2 text-sm font-medium tracking-tighter text-gray-900 dark:text-white lg:text-2xl 2xl:text-3xl 3xl:text-4xl">
          {balance}
          <span className="">{symbol}</span>
        </div>
      </div>

      <div
        className="h-20 w-full"
        data-hello={isChangePositive ? '#22c55e' : '#D6455D'}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={prices}>
            <defs>
              <linearGradient id={`${name}-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isChangePositive ? '#22c55e' : '#D6455D'}
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor={isChangePositive ? '#22c55e' : '#D6455D'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="linear"
              dataKey="value"
              stroke={isChangePositive ? '#22c55e' : '#D6455D'}
              strokeWidth={2.5}
              fill='transparent'
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function PriceFeedSlider({ priceFeeds }) {
  const isMounted = useIsMounted();
  const breakpoint = useBreakpoint();

  const { data, error } = useSWR('https://singular.app/api/stats/collection/3208723ec6f65df810-ITEM?rmrk2Only=false', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading Quiz...</div>

  nftFeedData[0]['balance'] = data.totalNFTs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  nftFeedData[1]['balance'] = data.owners.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  nftFeedData[2]['balance'] = data.volume.all.toFixed(1) + ' KSM';

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
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        {priceFeeds.map((item) => (
          <NftFeed key={item.id} {...item} />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        {priceFeeds.map((item) => (
          <NftFeed key={item.id} {...item} />
        ))}
      </div>
    );
}
