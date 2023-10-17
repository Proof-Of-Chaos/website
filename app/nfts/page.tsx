"use client";

import { ApiStatus } from "@/components/api-status";
import { title } from "@/components/primitives";

export const revalidate = 3600;

export default function NFTPage() {
  return (
    <div>
      <h1 className={title({ siteTitle: true })}>NFTs</h1>
      <p className="text-center text-4xl">🔧</p>
      <p className="text-center py-8 px-4">
        The NFT page is currently under construction as we are preparing the
        transition from RMRK NFTs to nft pallet NFTs
      </p>
      <ApiStatus />
      <p className="text-center text-4xl">🔥</p>
    </div>
  );
}
