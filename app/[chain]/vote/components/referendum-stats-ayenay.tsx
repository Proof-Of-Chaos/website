import { usePolkadotApis } from "@/context/polkadot-api-context";
import { bnToBn, formatBalance } from "@polkadot/util";
import { BNToFixedPercentage } from "../util";

export function ReferendumStatsAyeNay({
  ayes,
  nays,
  total,
  threshold,
}: {
  ayes?: string;
  nays?: string;
  total?: string;
  threshold?: number;
}) {
  const { activeChainInfo } = usePolkadotApis();
  const { decimals, symbol } = activeChainInfo;

  const ayePercentage =
    ayes && total && total !== "0"
      ? BNToFixedPercentage(bnToBn(ayes), bnToBn(total))
      : 0;

  const nayPercentage = 100 - ayePercentage;

  const ayeVoteVolume = formatBalance(ayes, {
    decimals,
    withSi: true,
    withUnit: symbol,
    withZero: false,
  });

  const nayVoteVolume = formatBalance(nays, {
    decimals,
    withSi: true,
    withUnit: symbol,
    withZero: false,
  });

  return (
    <div>
      <div className="mb-2">
        <svg width="100%" height="10" className="rounded-md">
          <rect x="0" y="0" width="100%" height="12" fill="rgb(248,113,113)" />
          <rect
            x="0"
            y="0"
            height="12"
            fill="rgb(74,222,128)"
            width={`${ayePercentage}%`}
          />
        </svg>
      </div>
      <div className="flex items-start justify-between gap-1">
        <div className="text-green-500 text-left">
          <h5 className="uppercase text-sm">Aye ({ayePercentage}%)</h5>
          <p className="text-sm">{ayeVoteVolume}</p>
        </div>
        <div className="text-red-500 text-right">
          <h5 className="uppercase text-sm">({nayPercentage}%) Nay</h5>
          <p className="text-sm">{nayVoteVolume}</p>
        </div>
      </div>
    </div>
  );
}
