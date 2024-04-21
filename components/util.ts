import {
  RewardConfiguration,
  RewardOption,
} from "@/app/[chain]/referendum-rewards/types";
import { ChainConfig, SubstrateChain } from "@/types";
import { getChainInfo } from "@/config/chains";

export const trimAddress = (address: string, amount: number = 5) => {
  if (!address) {
    return "";
  }
  return `${address.slice(0, amount)}...${address.slice(-amount)}`;
};

export const titleCase = (s: string | undefined) =>
  s &&
  s.replace(/^_*(.)|_+(.)/g, (_, c, d) =>
    c ? c.toUpperCase() : " " + d.toUpperCase()
  );

export function mergeWithDefaultConfig(config: any, chain: SubstrateChain): RewardConfiguration {
  const chainConfig: ChainConfig = getChainInfo(chain);
  return {
    ...chainConfig.DEFAULT_REWARDS_CONFIG,
    ...config,
    collectionConfig: {
      ...chainConfig.DEFAULT_REWARDS_CONFIG.collectionConfig,
      ...config.collectionConfig,
    },
    options: chainConfig.DEFAULT_REWARDS_CONFIG.options.map(
      (defaultOption: RewardOption) => {
        const overrideOption = config.options?.find(
          (option: any) => option.rarity === defaultOption.rarity
        );

        return {
          ...defaultOption,
          ...(overrideOption || {}),
        };
      }
    ),
  };
}
