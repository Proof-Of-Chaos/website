import {
  PalletConvictionVotingVoteCasting,
  PalletConvictionVotingVoteVoting,
  PalletReferendaReferendumInfoConvictionVotingTally,
} from "@polkadot/types/lookup";
import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  InjectedAccountWithMeta,
  InjectedExtension,
} from "@polkadot/extension-inject/types";
import { ReactNode, ReactSVGElement, SVGProps } from "react";
import { Header } from "@polkadot/types/interfaces";
import { RewardOption } from "@/app/[chain]/referendum-rewards/types";
import { BN } from "@polkadot/util";
import { subtitle } from "../components/primitives";

export enum SubstrateChain {
  Kusama = "kusama",
  Polkadot = "polkadot",
  Westend = "westend",
  Rococo = "rococo",
  Local = "local",
}

// export enum ChainType {
//   Relay = "relay",
//   AssetHub = "assetHub",
//   BridgeHub = "bridgeHub",
// }

export type ChainType = "relay" | "assetHub" | "bridgeHub";

export type ChainConfig = {
  name: SubstrateChain;
  symbol: string;
  decimals: number;
  ss58Format: number;
  blockTime: number;
  endpoints: EndpointMap;
  selectedEndpoint: number;
  selectedAssetHubEndpoint: number;
  tracks: any[];
  icon: React.FC<IconSvgProps>;
  provider?: WsProvider;
  assetHubProvider?: WsProvider;
  api?: ApiPromise;
  assetHubApi?: ApiPromise;
  subscan?: string;
  subscanAssetHub?: string;
  kodadot?: string;
};

export type PolkadotExtensionType = {
  isReady: boolean;
  accounts?: InjectedAccountWithMeta[];
  injector?: InjectedExtension;
  actingAccountIdx: number;
  error?: Error;
};

export type Endpoint = {
  name: string;
  url: string;
};

export type EndpointMap = {
  [key in ChainType]?: Endpoint[];
};

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface SendAndFinalizeResult {
  status: string;
  message: string;
  txHash?: string;
  events?: any[];
  blockHeader?: Header;
  toast?: ToastType;
}

export type ToastType =
  | undefined
  | {
      title: string;
      messages?: string[];
    };

export type ConvictionVote = {
  // The particular governance track
  track: number;
  // The account that is voting
  address: string;
  // The index of the referendum
  referendumIndex: string;
  // The conviction being voted with, ie `None`, `Locked1x`, `Locked5x`, etc
  conviction: string;
  // The balance they are voting with themselves, sans delegated balance
  balance: {
    aye: string;
    nay: string;
    abstain: string;
  };
  // The total amount of tokens that were delegated to them (including conviction)
  delegatedConvictionBalance?: string;
  // the total amount of tokens that were delegated to them (without conviction)
  delegatedBalance?: string;
  // The vote type, either 'aye', or 'nay'
  voteDirection: string;
  // Either "Standard", "Split", or "SplitAbstain",
  voteDirectionType: string;
  // Whether the person is voting themselves or delegating
  voteType: string;
  // Who the person is delegating to
  delegatedTo: string | null;
};

export interface DecoratedConvictionVote extends ConvictionVote {
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

export interface UserVotesReturnType {
  votes: DecoratedConvictionVote[];
  delegations: ConvictionDelegation[];
}

export type Chances = { [key: string]: number };

export interface DirectVoteLock extends Lock {
  classId: BN;
  endBlock: BN;
  locked: string;
  refId: BN;
  total: BN;
}

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

export type ConvictionDelegation = {
  track: number;
  address: string;
  target: string;
  balance: string;
  // The balance times the conviction
  effectiveBalance: string;
  conviction: string;
  // The total amount of tokens that were delegated to them (including conviction)
  delegatedConvictionBalance: string;
  // the total amount of tokens that were delegated to them (without conviction)
  delegatedBalance: string;
  prior: any;
};

export interface VotePolkadot {
  accountId: string;
  track: number;
  voteData: PalletConvictionVotingVoteVoting;
}

export type StreamResult =
  | {
      done: boolean;
      value: string;
    }
  | undefined;

export type ResponseDataWalletVotesIndexer = {
  _metadata: {
    lastProcessedHeight: number;
    indexerHealthy: boolean;
  };
  castingVotings: {
    nodes: CastingVotingNode[];
  };
  delegatorVotings: {
    nodes: DelegatorVotingNode[];
  };
};

export type CastingVotingNode = {
  referendumId: string;
  standardVote: {
    aye: boolean;
    vote: Vote;
  } | null;
  splitVote: {
    ayeAmount: string;
    nayAmount: string;
  } | null;
  splitAbstainVote: {
    ayeAmount: string;
    nayAmount: string;
    abstainAmount: string;
  } | null;
  referendum: {
    trackId: number;
  };
};

export type DelegatorVotingNode = {
  vote: Vote;
  parent: {
    referendumId: string;
    voter: string;
    standardVote: {
      aye: boolean;
      vote: Vote;
    } | null;
    splitVote: {
      ayeAmount: string;
      nayAmount: string;
    } | null;
    splitAbstainVote: {
      ayeAmount: string;
      nayAmount: string;
      abstainAmount: string;
    } | null;
    referendum: {
      trackId: number;
    };
  };
};

export type Vote = {
  amount: string;
  conviction: string;
};
