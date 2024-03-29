import {
  decorateWithPolkassemblyInfo,
  getTitleAndContentForRef,
  transformReferendum,
} from "@/app/[chain]/vote/util";
import { getChainByName } from "@/config/chains";
import { SubstrateChain } from "@/types";
import { cache } from "react";

export const revalidate = 200;

export const preload = (chain: SubstrateChain) => {
  void getChainInfo(chain);
};

export const getChainInfo = cache(async (selectedChain: SubstrateChain) => {
  const safeChain = (selectedChain as SubstrateChain) || SubstrateChain.Kusama;
  const chainConfig = await getChainByName(safeChain);
  const { symbol, decimals } = chainConfig;

  return {
    symbol,
    decimals,
  };
});
