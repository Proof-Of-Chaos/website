import { polkadot } from "./polkadot";
import { kusama } from "./kusama";
import { SubstrateChain } from "@/types";
import { ApiPromise, WsProvider } from "@polkadot/api";

export const ENABLED_CHAINS = {
  [kusama.name]: kusama,
  [polkadot.name]: polkadot,
};

export const DEFAULT_CHAIN = SubstrateChain.Kusama;

export function getChainInfo(name: SubstrateChain) {
  const chainSettings = ENABLED_CHAINS[name];

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
  const chainSettings = ENABLED_CHAINS[name];

  if (!chainSettings) {
    throw `can not get chain settings of ${name}`;
  }

  if (!chainSettings.provider) {
    // console.log(`creating provider for ${name}`);
    chainSettings.provider = new WsProvider(chainSettings.endpoints[0].url);
  } else {
    // console.log(`provider from cache for ${name}`);
  }
  if (!chainSettings.api) {
    // console.log(`creating api for ${name}`);
    chainSettings.api = await ApiPromise.create({
      provider: chainSettings.provider,
    });

    chainSettings.api.on("disconnected", () => {
      // console.log(`disconnected from ${name}`);
    });

    chainSettings.api.on("error", () => {
      // console.log(`error from ${name}`);
    });
  } else {
    // console.log(`api from cache for ${name}`);
  }

  // console.log(`waiting for api ready for ${name}`);
  await chainSettings.api.isReady;

  // console.log(
  //   `api ready for ${name}. Connected to ${chainSettings.api.runtimeVersion.specName} spec:${chainSettings.api.runtimeVersion.specVersion} at ${chainSettings.endpoints[0].url}`
  // );

  return chainSettings;
}
