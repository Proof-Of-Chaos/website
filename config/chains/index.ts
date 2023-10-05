import { polkadot } from "./polkadot";
import { kusama } from "./kusama";
import { ChainConfig, ChainType, SubstrateChain } from "@/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { rococo } from "./rococo";
import { chain } from "lodash";

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

  if (!chainSettings.provider) {
    console.log(`creating provider for ${name}`);

    const relayEndpoints = chainSettings.endpoints[ChainType.Relay];

    if (!relayEndpoints) {
      throw `can not get relay endpoints of ${name}`;
    }

    chainSettings.provider = new WsProvider(
      relayEndpoints.map((e) => e.url),
      1000,
      undefined,
      5000
    );
  } else {
    console.log(`provider from cache for ${name}`);
  }
  if (!chainSettings.assetHubProvider) {
    const assetHubEndpoints = chainSettings.endpoints[ChainType.AssetHub];
    if (!assetHubEndpoints) {
      throw `can not get AssetHub endpoints of ${name}`;
    }

    chainSettings.assetHubProvider = new WsProvider(
      assetHubEndpoints.map((e) => e.url),
      1000,
      undefined,
      5000
    );
  }
  if (!chainSettings.api) {
    console.log(`creating api for ${name}`);
    chainSettings.api = await ApiPromise.create({
      provider: chainSettings.provider,
    });

    chainSettings.api.on("connected", () => {
      console.log(
        `⚡️ ${name} relay api ready. Connected to ${chainSettings.api?.runtimeVersion.specName} spec:${chainSettings.api?.runtimeVersion.specVersion}`
      );
    });

    chainSettings.api.on("disconnected", () => {
      console.log(`disconnected from ${name} relay`);
    });

    chainSettings.api.on("error", () => {
      console.log(`error from ${name} relay`);
    });
  } else {
    console.log(`api from cache for ${name}`);
  }
  if (!chainSettings.assetHubApi) {
    chainSettings.assetHubApi = await ApiPromise.create({
      provider: chainSettings.assetHubProvider,
    });
  }

  chainSettings.assetHubApi?.on("connected", () => {
    console.log(
      `⚡️ ${name} assetHub api ready. Connected to ${chainSettings.api?.runtimeVersion.specName} spec:${chainSettings.api?.runtimeVersion.specVersion}`
    );
  });

  chainSettings.assetHubApi.on("disconnected", () => {
    console.log(`disconnected from ${name} assethub`);
  });

  chainSettings.assetHubApi.on("error", () => {
    console.log(`error from ${name} assethub`);
  });

  // console.log(`waiting for api ready for ${name}`);
  await chainSettings.api.isReady;
  await chainSettings.assetHubApi.isReady;

  // console.log(
  //   `api ready for ${name}. Connected to ${chainSettings.api.runtimeVersion.specName} spec:${chainSettings.api.runtimeVersion.specVersion} at ${chainSettings.endpoints[0].url}`
  // );

  return chainSettings;
}
