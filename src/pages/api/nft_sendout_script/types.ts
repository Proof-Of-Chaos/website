import { DeriveReferendumVote } from "@polkadot/api-derive/types";
import { Bytes } from "@polkadot/types";
import { BN } from "@polkadot/util";
import { pinImageAndMetadataForOptions } from "./tools/pinataUtils";

export interface VoteConviction extends ConvictionVote {
  lockedWithConviction?: BN;
  dragonEquipped?: string;
  quizCorrect?: number;
  encointerScore?: number;
  meetsRequirements?: boolean;
  lockedWithConvictionDecimal?: number;
  // the chances for each rarity option
  chances?: Chances;
  // the option that was chosen for the voter
  chosenOption?: RewardOption;
}

export type GenerateRewardsResult = {
  call: string | undefined;
  kusamaCall: string | undefined;
  kusamaAssetHubCall: string | undefined;
  kusamaAssetHubTxs: string[] | undefined;
  distribution: RarityDistribution | undefined;
  fees:
    | {
        kusama: string;
        nfts: string;
      }
    | undefined;
  txsCount:
    | {
        kusama: number;
        nfts: number;
      }
    | undefined;
};

export type CreateCollectionResult = {
  call: string | undefined;
  kusamaAssetHubCall: string | undefined;
  kusamaAssetHubTxs: string[] | undefined;
  fees: string | undefined;
  txsCount: number | undefined;
};

export interface VoteConvictionDragon extends VoteConviction {
  dragonEquipped: string;
}

export interface VoteConvictionDragonQuiz extends VoteConvictionDragon {
  quizCorrect: number;
}

export interface VoteConvictionDragonQuizEncointer
  extends VoteConvictionDragonQuiz {
  encointerScore: number;
}

export interface VoteConvictionEncointer extends VoteConviction {
  encointerScore: number;
}

export interface VoteConvictionRequirements extends VoteConviction {
  meetsRequirements: boolean;
  lockedWithConvictionDecimal: number;
}

export type PalletReferenda =
  | "referenda"
  | "rankedPolls"
  | "fellowshipReferenda";

export type PalletVote =
  | "convictionVoting"
  | "rankedCollective"
  | "fellowshipCollective";

export interface Lock {
  endBlock: BN;
  total: BN;
}

export interface DirectVoteLock extends Lock {
  classId: BN;
  endBlock: BN;
  locked: string;
  refId: BN;
  total: BN;
}

export type LockResult = Record<string, LockResultItem[]>;

export interface LockResultItem {
  classId: BN;
}

export type DelegatingData = {
  delegating: {
    balance: number;
    target: string;
    conviction: string;
    delegations: {
      votes: number;
      capital: number;
    };
    prior: number[];
  };
};

export type ConvictionVote = {
  // The particular governance track
  track: number;
  // The account that is voting
  address: string;
  // The index of the referendum
  referendumIndex: number;
  // The conviction being voted with, ie `None`, `Locked1x`, `Locked5x`, etc
  conviction: string;
  // The balance they are voting with themselves, sans delegated balance
  balance: {
    aye: number;
    nay: number;
    abstain: number;
  };
  // The total amount of tokens that were delegated to them (including conviction)
  delegatedConvictionBalance: number;
  // the total amount of tokens that were delegated to them (without conviction)
  delegatedBalance: number;
  // The vote type, either 'aye', or 'nay'
  voteDirection: string;
  // Either "Standard", "Split", or "SplitAbstain",
  voteDirectionType: string;
  // Whether the person is voting themselves or delegating
  voteType: string;
  // Who the person is delegating to
  delegatedTo: string;
};

export type ConvictionDelegation = {
  track: number;
  address: string;
  target: string;
  balance: number;
  // The balance times the conviction
  effectiveBalance: number;
  conviction: string;
  // The total amount of tokens that were delegated to them (including conviction)
  delegatedConvictionBalance: number;
  // the total amount of tokens that were delegated to them (without conviction)
  delegatedBalance: number;
  prior: any;
};

// The constant data of an OpenGov Track
export type TrackInfo = {
  trackIndex: string;
  name: string;
  maxDeciding: number;
  decisionDeposit: number;
  preparePeriod: number;
  decisionPeriod: number;
  confirmPeriod: number;
  minEnactmentPeriod: number;
};

export type Chances = { [key: string]: number };

export type OpenGovReferendum = {
  index: number;
  track: number;
  origin: string;
  proposalHash: string;
  enactmentAfter: number;
  submitted: number;
  submissionWho: string | null;
  // submissionIdentity: string | null;
  submissionAmount: number | null;
  decisionDepositWho: string | null;
  decisionDepositAmount: number | null;
  decidingSince: number | null;
  decidingConfirming: boolean | null;
  ayes: number;
  nays: number;
  support: number;
  inQueue: boolean;
  currentStatus: string;
  confirmationBlockNumber: number | null;
  //alarm
};

export interface SquidStatus {
  height: number;
}

export interface EncointerMetadata {
  name: string;
  symbol: string;
  assets: string;
  theme: string | null;
  url: string | null;
}

export interface EncointerCommunity {
  name: string;
  symbol: string;
  geoHash: string;
  digest: string;
}

export interface ParaInclusions {
  backedCandidates: Array<{
    candidate: {
      descriptor: {
        paraId: number;
        paraHead: string;
      };
    };
  }>;
}

export interface QuizSubmission {
  blockNumber: number;
  quizId: string;
  timestamp: string;
  version: string;
  wallet: string;
  answers: Answer[];
}

interface Answer {
  isCorrect: boolean;
}

export interface RarityDistribution {
  [key: string]: number;
}

interface Attribute {
  name: "rarity" | "totalSupply" | "artist" | "name" | "typeOfVote";
  value: string | Uint8Array | Bytes;
}

export type MetadataCid = {
  direct: string;
  delegated: string;
};

export interface ProcessMetadataResult {
  metadataCids: {
    [key: string]: {
      direct: string;
      delegated: string;
    };
  };
  attributes: {
    [key: string]: {
      direct: string;
      delegated: string;
    };
  };
}

export type PinImageAndMetadataForOptionsResult = {
  imageIpfsCids: {
    [key: string]: {
      direct: string;
      delegated: string;
    };
  };
  metadataIpfsCids: {
    [key: string]: {
      direct: string;
      delegated: string;
    };
  };
};

export type PinImageAndMetadataForCollectionResult = {
  imageIpfsCid: string;
  metadataIpfsCid: string;
};

export type PinImageAndMetadataForConfigNFTResult = {
  imageIpfsCid: string;
  metadataIpfsCid: string;
};

export type NftAttributesResult = {
  [key: string]: {
    direct: string;
    delegated: string;
  };
};

export type RNG = () => number;

export interface FetchReputableVotersParams {
  confirmationBlockNumber: number;
  getEncointerBlockNumberFromKusama: (kusamaBlock: number) => Promise<number>;
  getCurrentEncointerCommunities: (
    block: number
  ) => Promise<EncointerCommunity[]>;
  getLatestEncointerCeremony: (block: number) => Promise<number>;
  getReputationLifetime: (block: number) => Promise<number>;
  getCeremonyAttendants: (
    community: EncointerCommunity,
    cIndex: number,
    encointerBlock: number
  ) => Promise<any[]>;
}

export interface DragonBonus {
  wallet: string;
}

export interface Bonuses {
  babies: DragonBonus[];
  toddlers: DragonBonus[];
  adolescents: DragonBonus[];
  adults: DragonBonus[];
}

export interface CollectionConfiguration {
  file: any;
  id: number;
  name: string;
  description: string;
  metadataCid?: string | null;
  isNew?: boolean;
}

export interface ConfigNFT {
  file: any;
  description: string;
  imageCid?: string;
  metadataCid?: string | null;
  settingsCollectionId: number;
}

export interface RewardConfiguration {
  refIndex: string;
  min: string;
  max: string;
  first: number | null;
  blockCutOff: number | null;
  directOnly: boolean;
  collectionConfig: CollectionConfiguration;
  configNFT: ConfigNFT;
  // babyBonus: number;
  // toddlerBonus: number;
  // adolescentBonus: number;
  // adultBonus: null;
  // quizBonus: number;
  // identityBonus: null;
  // encointerBonus: number;
  minAmount: number;
  defaultRoyalty: number;
  royaltyAddress: string;
  options: RewardOption[];
  minValue?: number | null;
  maxValue?: number | null;
  median?: number | null;
  minVote?: number | null;
  maxVote?: number | null;
  sender?: string;
  seed?: string;
}

export interface RewardOption {
  description: String;
  maxProbability: number | null;
  minProbability: number | null;
  transferable: boolean;
  artist: string;
  rarity: string;
  itemName: string;
  minRoyalty: number;
  maxRoyalty: number;
  metadataCidDirect?: string;
  metadataCidDelegated?: string;
  file?: any;
}

export interface SendAndFinalizeResult {
  status: string;
  message: string;
  txHash?: string;
  events?: any[];
  toast?: ToastType;
}

export type ToastType =
  | undefined
  | {
      title: string;
      messages: string[];
    };
