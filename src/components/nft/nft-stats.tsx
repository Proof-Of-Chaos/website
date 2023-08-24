import { useBreakpoint } from "../../hooks/use-breakpoint";
import { useIsMounted } from "../../hooks/use-is-mounted";
import { useCollectionData } from "../../hooks/use-collection-data";
import { useEffect } from "react";

export function NftStatsSingle({ name, symbol, balance }) {
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
          <span className=""> {symbol}</span>
        </div>
      </div>
    </div>
  );
}

export function NftStats() {
  const { data, error } = useCollectionData();

  // console.log("data", data)

  let totalNFTs = 0;
  let owners = 0;
  let volume = 0;

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading statistics...</div>;

  data.forEach((collectionData) => {
    totalNFTs += collectionData.totalNFTs;
    owners = Math.max(owners, collectionData.owners);
    volume += collectionData.volume.all;
  });

  let totalNFTsString = totalNFTs
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const ownersString = owners.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const volumeString = volume.toFixed(1);

  return (
    data && (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <NftStatsSingle name="NFTs sent" symbol="" balance={totalNFTsString} />
        <NftStatsSingle
          name="Unique Holders"
          symbol=""
          balance={ownersString}
        />
        <NftStatsSingle
          name="Total Trade Volume"
          symbol="KSM"
          balance={volumeString}
        />
      </div>
    )
  );
}
