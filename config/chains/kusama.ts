import {
  ChainConfig,
  ChainType,
  Endpoint,
  EndpointMap,
  SubstrateChain,
} from "@/types";
import { KusamaIcon, PolkadotIcon } from "@/components/icons";
import { BN, formatBalance } from "@polkadot/util";
import { RewardCriteria } from "@/app/[chain]/referendum-rewards/types";

const kusamaConfig = {
  symbol: "KSM",
  decimals: 12,
  ss58Format: 2,
  blockTime: 6000,
};

const formatSpend = (mul: number, value: BN): string =>
  `${formatBalance(value.muln(mul), {
    decimals: kusamaConfig.decimals,
    forceUnit: "-",
    withSi: true,
    withUnit: kusamaConfig.symbol,
  })}`;

// https://github.com/paritytech/polkadot/blob/6e3f2c5b4b6e6927915de2f784e1d831717760fa/runtime/kusama/constants/src/lib.rs#L28-L32
const UNITS = new BN(1_000_000_000_000);
const QUID = UNITS.divn(30);
const GRAND = QUID.muln(1_000);

// https://github.com/paritytech/polkadot/blob/6e3f2c5b4b6e6927915de2f784e1d831717760fa/runtime/kusama/src/governance/origins.rs#L170-L179
const SPEND_LIMITS = {
  BigSpender: formatSpend(1_000, GRAND),
  BigTipper: formatSpend(1, GRAND),
  MediumSpender: formatSpend(100, GRAND),
  SmallSpender: formatSpend(10, GRAND),
  SmallTipper: formatSpend(250, QUID),
  Treasurer: formatSpend(10_000, GRAND),
};

const endpoints: EndpointMap = {
  relay: [
    {
      name: "Parity",
      url: "wss://kusama-rpc.polkadot.io",
    },
    // {
    //   name: "OnFinality",
    //   url: "wss://kusama.api.onfinality.io/public-ws",
    // },
    {
      name: "Dwellir",
      url: "wss://kusama-rpc.dwellir.com",
    },
    {
      name: "Dwellir Tunisia",
      url: "wss://kusama-rpc-tn.dwellir.com",
    },
    {
      name: "Automata 1RPC",
      url: "wss://1rpc.io/ksm",
    },
    {
      name: "IBP-GeoDNS1",
      url: "wss://rpc.ibp.network/kusama",
    },
    {
      name: "IBP-GeoDNS2",
      url: "wss://rpc.dotters.network/kusama",
    },
    {
      name: "RadiumBlock",
      url: "wss://kusama.public.curie.radiumblock.co/ws",
    },
  ],
  assetHub: [
    { name: "Dwellir", url: "wss://statemine-rpc.dwellir.com" },
    { name: "Dwellir Tunisia", url: "wss://statemine-rpc-tn.dwellir.com" },
    { name: "IBP-GeoDNS1", url: "wss://sys.ibp.network/statemine" },
    { name: "IBP-GeoDNS2", url: "wss://sys.dotters.network/statemine" },
    { name: "LuckyFriday", url: "wss://rpc-asset-hub-kusama.luckyfriday.io" },
    // { name: // OnFinality, url:'wss://statemine.api.onfinality.io/public-ws'},
    { name: "Parity", url: "wss://kusama-asset-hub-rpc.polkadot.io" },
    {
      name: "RadiumBlock",
      url: "wss://statemine.public.curie.radiumblock.co/ws",
    },
    { name: "Stakeworld", url: "wss://ksm-rpc.stakeworld.io/assethub" },
  ],
};

const DEFAULT_REWARDS_CONFIG = {
  chain: SubstrateChain.Kusama,
  refIndex: "",
  criteria: RewardCriteria.Referenda,
  min: "1200000000000",
  max: "100000000000000000000000000000000000000000",
  first: null,
  blockCutOff: null,
  directOnly: false,
  configNFT: {
    settingsCollectionId: parseInt(
      process.env.KUSAMA_CONFIG_COLLECTION_ID || "86"
    ),
    file: undefined,
    imageCid: "ipfs://ipfs/QmZX9JAhur4ozT2mbHBVAWNRFZGfFRQLgkRgd1yyE35eme",
    description:
      "This is the config NFT for the referendum rewards. You can use this NFT to verify the configuration that was used for the specific sendout.",
  },
  collectionConfig: {
    id: 195,
    name: "",
    description: "",
    isNew: false,
    file: undefined,
  },
  // babyBonus: 7,
  // toddlerBonus: 13,
  // adolescentBonus: 16,
  // adultBonus: null,
  // quizBonus: 20,
  // identityBonus: null,
  // encointerBonus: 50,
  minAmount: 0.2,
  defaultRoyalty: 95,
  royaltyAddress: "",
  options: [
    {
      maxProbability: 25,
      minProbability: 3,
      transferable: true,
      artist: "",
      rarity: "epic",
      title: "epic",
      royalty: 30,
      description: "",
    },
    {
      maxProbability: 40,
      minProbability: 10,
      transferable: true,
      artist: "",
      rarity: "rare",
      title: "rare",
      royalty: 25,
      description: "",
    },
    {
      maxProbability: 67,
      minProbability: 28,
      transferable: true,
      artist: "",
      rarity: "common",
      title: "common",
      royalty: 20,
      description: "",
    },
  ],
  isMetadataLocked: false,
  isAttributesLocked: false,
}

const tracks = [
  {
    id: 0,
    name: "root",
    origin: { system: "Root" },
    text: "Origin for the system root",
  },
  {
    id: 1,
    name: "whitelisted_caller",
    origin: { Origins: "WhitelistedCaller" },
    text: "Origin able to dispatch a whitelisted call",
  },
  {
    id: 10,
    name: "staking_admin",
    origin: { Origins: "StakingAdmin" },
    text: "Origin for cancelling slashes",
  },
  {
    id: 11,
    name: "treasurer",
    origin: { Origins: "Treasurer" },
    text: "Origin for spending (any amount of) funds",
  },
  {
    id: 12,
    name: "lease_admin",
    origin: { Origins: "LeaseAdmin" },
    text: "Origin able to force slot leases",
  },
  {
    id: 13,
    name: "fellowship_admin",
    origin: { Origins: "FellowshipAdmin" },
    text: "Origin for managing the composition of the fellowship",
  },
  {
    id: 14,
    name: "general_admin",
    origin: { Origins: "GeneralAdmin" },
    text: "Origin for managing the registrar",
  },
  {
    id: 15,
    name: "auction_admin",
    origin: { Origins: "AuctionAdmin" },
    text: "Origin for starting auctions",
  },
  {
    id: 20,
    name: "referendum_canceller",
    origin: { Origins: "ReferendumCanceller" },
    text: "Origin able to cancel referenda",
  },
  {
    id: 21,
    name: "referendum_killer",
    origin: { Origins: "ReferendumKiller" },
    text: "Origin able to kill referenda",
  },
  {
    id: 30,
    name: "small_tipper",
    origin: { Origins: "SmallTipper" },
    text: `Origin able to spend up to ${SPEND_LIMITS.SmallTipper} from the treasury at once`,
  },
  {
    id: 31,
    name: "big_tipper",
    origin: { Origins: "BigTipper" },
    text: `Origin able to spend up to ${SPEND_LIMITS.BigTipper} from the treasury at once`,
  },
  {
    id: 32,
    name: "small_spender",
    origin: { Origins: "SmallSpender" },
    text: `Origin able to spend up to ${SPEND_LIMITS.SmallSpender} from the treasury at once`,
  },
  {
    id: 33,
    name: "medium_spender",
    origin: { Origins: "MediumSpender" },
    text: `Origin able to spend up to ${SPEND_LIMITS.MediumSpender} from the treasury at once`,
  },
  {
    id: 34,
    name: "big_spender",
    origin: { Origins: "BigSpender" },
    text: `Origin able to spend up to ${SPEND_LIMITS.BigSpender} from the treasury at once`,
  },
];

export const kusama: ChainConfig = {
  name: SubstrateChain.Kusama,
  endpoints,
  selectedAssetHubEndpoint: 0,
  selectedEndpoint: 0,
  subscan: "https://kusama.subscan.io/",
  subscanAssetHub: "https://assethub-kusama.subscan.io",
  kodadot: "https://kodadot.xyz/ahk",
  icon: KusamaIcon,
  tracks,
  ...kusamaConfig,
  DEFAULT_REWARDS_CONFIG
};
