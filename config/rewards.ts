import {
  RewardConfiguration,
  RewardCriteria,
} from "@/app/[chain]/referendum-rewards/types";
import { SubstrateChain } from "@/types";

export type RewardsConfigType = {
  royaltyAddress: string;
  acceptedNftFormats: string[];
  acceptedNonImageFormats: string[];
  maxFileSize: number;
  DEFAULT_REWARDS_CONFIG: RewardConfiguration;
  rewardsFilter: string[];
  NFT_BATCH_SIZE_MAX: number;
};

export const rewardsConfig: RewardsConfigType = {
  // maximum number of txs to call in one batchAll, it is limited by block size
  NFT_BATCH_SIZE_MAX: process.env.NEXT_PUBLIC_BATCH_SIZE_MAX
    ? parseInt(process.env.NEXT_PUBLIC_BATCH_SIZE_MAX)
    : 700,
  //for tetsing, only consider the following addresses for the sendout
  rewardsFilter: process.env.REWARDS_FILTER_ADDRESSES
    ? process.env.REWARDS_FILTER_ADDRESSES.split(",")
    : [],
  royaltyAddress:
    process.env.NEXT_PUBLIC_ROYALTY_ADDRESS ||
    "Go8NpTvzdpfpK1rprXW1tE4TFTHtd2NDJCqZLw5V77GR8r4",
  acceptedNonImageFormats: [
    "video/mp4",
    "video/webp",
    "audio/mp3",
    "audio/mpeg",
    "audio/flac",
    "3d/glb",
  ],
  acceptedNftFormats: [
    "video/mp4",
    "video/webp",
    "audio/mp3",
    "audio/flac",
    "audio/mpeg",
    "3d/glb",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/svg",
    "image/bmp",
  ],
  maxFileSize: 2 * 1024 * 1024,
  DEFAULT_REWARDS_CONFIG: {
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
        process.env.NEXT_PUBLIC_SETTINGS_COLLECTION_ID || "86"
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
  },
};
