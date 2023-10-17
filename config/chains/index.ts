import { polkadot } from "./polkadot";
import { kusama } from "./kusama";
import { ChainConfig, ChainType, SubstrateChain } from "@/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { rococo } from "./rococo";
import { chain } from "lodash";
import { ApiCache } from "./ApiCache";

export const CHAINS_ENABLED: Partial<Record<SubstrateChain, ChainConfig>> = {
  [SubstrateChain.Kusama]: kusama,
  [SubstrateChain.Polkadot]: polkadot,
  [SubstrateChain.Rococo]: rococo,
};

export const DEFAULT_CHAIN = SubstrateChain.Kusama;

export function getChainInfo(name: SubstrateChain): ChainConfig {
  const chainSettings = CHAINS_ENABLED[name];

  if (!chainSettings) {
    throw `can not get chain info of ${name}`;
  }

  return chainSettings;
}

/**
 * Get chain settings by name and create provider and api if not exists
 * @param name chain name
 * @returns
 */
export async function getChainByName(name: SubstrateChain) {
  const chainSettings = CHAINS_ENABLED[name];

  if (!chainSettings) {
    throw `can not get chain settings of ${name}`;
  }

  const apis = await ApiCache.getApis(name);

  chainSettings.api = apis["relay"]?.api;
  chainSettings.assetHubApi = apis["assetHub"]?.api;

  // console.log(`waiting for api ready for ${name}`);
  await chainSettings.api?.isReady;
  await chainSettings.assetHubApi?.isReady;

  return chainSettings;
}
