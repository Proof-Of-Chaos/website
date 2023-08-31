import seedrandom from "seedrandom";
import type { Option } from "@polkadot/types";
import { pick } from "lodash";

import { BN } from "@polkadot/util";
import type {
  Lock,
  PalletReferenda,
  PalletVote,
  ConvictionVote,
  VoteConviction,
  RewardConfiguration,
  VoteConvictionRequirements,
  RarityDistribution,
  VoteConvictionEncointer,
  VoteConvictionDragon,
  QuizSubmission,
  VoteConvictionDragonQuiz,
  Bonuses,
  EncointerCommunity,
  FetchReputableVotersParams,
  DirectVoteLock,
  RNG,
} from "../types.js";
import { ApiDecoration } from "@polkadot/api/types";
import {
  getApiAt,
  getDecimal,
  getNetworkPrefix,
  sendAndFinalizeKeyPair,
} from "../../../../data/chain";
import { getApiKusamaAssetHub } from "../../../../data/getApi";
import { getConvictionVoting } from "./voteData";
import { lucksForConfig, weightedRandom } from "../../../../utils/utils";
import { ApiPromise } from "@polkadot/api";
import { GraphQLClient } from "graphql-request";
import { encodeAddress } from "@polkadot/util-crypto";
import { generateNFTId } from "./generateTxs";
import { initAccount } from "../../../../utils/server-utils";
import PinataClient from "@pinata/sdk";
import { pinMetadataForConfigNFT } from "../tools/pinataUtils";
import {
  PalletConvictionVotingVoteCasting,
  PalletConvictionVotingVoteVoting,
  PalletReferendaReferendumInfoConvictionVotingTally,
} from "@polkadot/types/lookup";
import { websiteConfig } from "../../../../data/website-config";

// Helper function to get vote parameters
const getVoteParams = (
  accountId: string,
  lockClasses?: BN[]
): [[accountId: string, classId: BN][]] | undefined => {
  if (lockClasses) {
    return [lockClasses.map((classId) => [accountId, classId])];
  }
  return undefined;
};

// Helper function to get referendum parameters
const getRefParams = (
  votes?: [
    classId: BN,
    refIds: BN[],
    casting: PalletConvictionVotingVoteCasting
  ][]
): [BN[]] | undefined => {
  if (votes && votes.length) {
    const refIds = votes.reduce<BN[]>(
      (all, [, refIds]) => all.concat(refIds),
      []
    );
    if (refIds.length) {
      return [refIds];
    }
  }
  return undefined;
};

// Helper function to calculate bonuses for wallets that meet the requirements
const applyBonusesFor = (
  bonusName: String,
  votes: VoteConviction[]
): VoteConviction[] => {
  //TODO this is a stub
  return votes;
};

/**
 * Given a referendum index, gets all the votes for that referendum. Also adds annotations that are relevant for the sendout script like the luckbonus and the finally received nft rarity.
 * @param referendumIndex
 * @returns
 */
export const getDecoratedVotesWithInfo = async (
  config: RewardConfiguration,
  chainDecimals: BN
): Promise<{
  decoratedVotes: VoteConviction[];
  distribution: RarityDistribution;
}> => {
  console.info(`↪ Getting referendum details and all voting wallets`);

  let { referendum, totalIssuance, votes } = await getConvictionVoting(
    parseInt(config.refIndex)
  );

  // start decorating the votes with additional information
  // TODO rename all below to decorateWith...

  console.info(
    `↪ Getting locks for referendum ${config.refIndex} with ${votes.length} votes.`
  );

  // 1. decorate `lockedWithConviction` - relevant info we consider instead of the vote * locked
  votes = await retrieveAccountLocks(
    votes,
    referendum.confirmationBlockNumber,
    referendum.track
  );

  // logger.info(`↪ Applying bonuses for referendum ${config.refIndex}.`)

  // 2. decorate with bonuses
  votes = applyBonusesFor("encointer", votes);
  votes = applyBonusesFor("dragon", votes);
  votes = applyBonusesFor("quiz", votes);

  console.info(
    `↪ Checking for votes meeting requirements for referendum ${config.refIndex} with ${votes.length} votes.`
  );

  // 3. decorate `meetsRequirements` - whether vote > threshold
  votes = await checkVotesMeetingRequirements(
    votes,
    totalIssuance,
    config,
    chainDecimals
  );

  console.info(
    `↪ calculating distribution for referendum ${config.refIndex} with ${votes.length} votes.`
  );

  // 4. get global min, max, median values for calculating the final rarity
  const {
    votesMeetingRequirements,
    votesNotMeetingRequirements,
    lowerLimitOfCurve,
    upperLimitOfCurve,
    medianOfCurve,
    minLockedWithConviction,
    maxLockedWithConviction,
  } = getVoteInfo(votes, config);

  console.info(
    `📊 Total votes: ${votes.length}, votes meeting requirements: ${votesMeetingRequirements.length}, votes not meeting requirements: ${votesNotMeetingRequirements.length}`
  );
  console.info(
    `📊 Max locked with conviction meeting requirements: ${maxLockedWithConviction}KSM, min locked with conviction meeting requirements: ${minLockedWithConviction}KSM`
  );
  console.info(
    `📊 This is the range of values used to compute the median as well as lower and upper limits of the 'luck' curve`
  );
  console.info(
    `📊 Computed lower limit of curve: ${lowerLimitOfCurve}KSM, upper limit of curve: ${upperLimitOfCurve}KSM, median of curve: ${medianOfCurve}KSM`
  );

  // 5. decorate with chances. E.g. chances: { common: 0.5, rare: 0.3, epic 0.2}
  console.info(`🎲 Calculating NFT probabilities and distribution`);
  const decoratedWithChancesVotes = decorateWithChances(
    votes,
    config,
    lowerLimitOfCurve,
    upperLimitOfCurve,
    medianOfCurve,
    0
    // logger
  );
  votes = decoratedWithChancesVotes.votesWithChances;

  if (websiteConfig.rewards_sendout_filter.length > 0) {
    votes = votes.filter((vote) =>
      websiteConfig.rewards_sendout_filter.includes(vote.address.toString())
    );

    console.warn(
      `🚨🚨🚨  TESTING, filtered votes to only send to ${votes.length} votes for referendum ${config.refIndex}`
    );
  }

  return {
    decoratedVotes: votes,
    distribution: decoratedWithChancesVotes.distribution,
  };
};

/**
 * Decorates the votes with two additional properties:
 * `chances` which is an object with the rarity as key and the chance as value.
 * `chosenOption` which is the option (NFT option with rarity) that was chosen for the voter.
 * @param votes
 * @param config
 * @param minVoteValue
 * @param maxVoteValue
 * @param medianVoteValue
 * @param seed
 * @returns
 */
const decorateWithChances = (
  votes: VoteConviction[],
  config: RewardConfiguration,
  lowerLimitOfCurve: number,
  upperLimitOfCurve: number,
  medianOfCurve: number,
  seed: number = 0
  // logger: Logger
): { votesWithChances: VoteConviction[]; distribution: RarityDistribution } => {
  //seed the randomizer
  const rng = seedrandom(seed.toString());

  config.lowerLimitOfCurve = lowerLimitOfCurve;
  config.upperLimitOfCurve = upperLimitOfCurve;
  config.medianOfCurve = medianOfCurve;

  const rarityDistribution = {};

  let votesWithChances = votes.map((vote) => {
    let chances = lucksForConfig(vote.lockedWithConvictionDecimal, config, 1.0);
    let chosenRarity = weightedRandom(
      rng,
      Object.keys(chances),
      Object.values(chances)
    );
    const chosenOption = config.options.find(
      (option) => option.rarity === chosenRarity
    );

    // Count the distribution
    rarityDistribution[chosenRarity] = rarityDistribution[chosenRarity]
      ? rarityDistribution[chosenRarity] + 1
      : 1;

    return { ...vote, chances, chosenOption };
  });

  //TODO this is not generic
  const invariantHolds =
    rarityDistribution["common"] > rarityDistribution["rare"] * 4 &&
    rarityDistribution["rare"] > rarityDistribution["epic"] * 2;

  if (invariantHolds) {
    // logger.info(
    //   `✅ Distribution invariant holds for ${JSON.stringify(
    //     rarityDistribution
    //   )} after ${seed} iterations.`
    // );
    config.seed = seed.toString();
    return { votesWithChances, distribution: rarityDistribution };
  } else {
    return decorateWithChances(
      votes,
      config,
      lowerLimitOfCurve,
      upperLimitOfCurve,
      medianOfCurve,
      ++seed
      // logger
    );
  }
};

const getVoteInfo = (
  votes: VoteConviction[],
  config: RewardConfiguration
): {
  votesMeetingRequirements: VoteConviction[];
  votesNotMeetingRequirements: VoteConviction[];
  lowerLimitOfCurve: number;
  upperLimitOfCurve: number;
  medianOfCurve: number;
  minLockedWithConviction: number;
  maxLockedWithConviction: number;
} => {
  const votesMeetingRequirements = votes.filter((vote) => {
    return vote.meetsRequirements;
  });

  const votesNotMeetingRequirements = votes.filter((vote) => {
    return !vote.meetsRequirements;
  });

  // Get the median and normalize min vote to threshold
  const threshold = config.minAmount;
  const {
    generatedLowerLimit: lowerLimitOfCurve,
    generatedUpperLimit: upperLimitOfCurve,
    median: medianOfCurve,
    min: minLockedWithConviction,
    max: maxLockedWithConviction,
  } = getLimitsAndMinMaxMedian(
    votesMeetingRequirements.map((vote) => vote.lockedWithConvictionDecimal),
    threshold
  );

  return {
    votesMeetingRequirements,
    votesNotMeetingRequirements,
    lowerLimitOfCurve,
    upperLimitOfCurve,
    medianOfCurve,
    minLockedWithConviction,
    maxLockedWithConviction,
  };
};

/**
 * Calculate the minimum, maximum, and median values of an array of vote amounts, considering only those above a critical value.
 * @param voteAmounts An array of vote amounts.
 * @param criticalValue The critical value to filter the vote amounts.
 * @returns An object containing the minimum, maximum, and median values.
 */
export const getLimitsAndMinMaxMedian = (
  voteAmounts: number[],
  criticalValue: number
): {
  generatedUpperLimit: number;
  generatedLowerLimit: number;
  min: number;
  max: number;
  median: number;
} => {
  const min = Math.min(...voteAmounts);
  const max = Math.max(...voteAmounts);
  if (voteAmounts.length < 4) {
    return {
      generatedUpperLimit: max,
      generatedLowerLimit: min,
      max,
      min,
      median: voteAmounts[Math.floor(voteAmounts.length / 2)],
    };
  }

  const filteredVotes = voteAmounts.filter((vote) => vote > criticalValue);

  let values, q1, q3, iqr, generatedLowerLimit, generatedUpperLimit, median;

  values = filteredVotes.slice().sort((a, b) => a - b); // Copy array and sort
  if ((values.length / 4) % 1 === 0) {
    // Find quartiles
    q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1]);
    q3 =
      (1 / 2) *
      (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1]);
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)];
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
  }

  if ((values.length / 2) % 1 === 0) {
    // Find median
    median =
      (1 / 2) * (values[values.length / 2] + values[values.length / 2 + 1]);
  } else {
    median = values[Math.floor(values.length / 2 + 1)];
  }

  iqr = q3 - q1;
  generatedUpperLimit = q3 + iqr * 1.5;
  generatedLowerLimit = Math.max(q1 - iqr * 1.5, criticalValue);

  return { generatedLowerLimit, generatedUpperLimit, min, max, median };
};

/**
 * Check if votes meet the specified requirements.
 * @param votes Array of VoteConvictionDragon objects.
 * @param totalIssuance Total issuance as a string.
 * @param config Configuration object with min, max, directOnly, and first properties.
 * @returns Array of VoteCheckResult objects containing meetsRequirements property.
 */
export const checkVotesMeetingRequirements = async (
  votes: VoteConviction[],
  totalIssuance: string,
  config: RewardConfiguration,
  chainDecimals: BN
): Promise<VoteConvictionRequirements[]> => {
  const minRequiredLockedWithConvicition = BN.max(
    new BN(config.min),
    new BN("0")
  );
  const maxAllowedLockedWithConvicition = BN.min(
    new BN(config.max),
    new BN(totalIssuance)
  );

  config.minRequiredLockedWithConvicition = getDecimal(
    minRequiredLockedWithConvicition.toString(),
    chainDecimals
  );
  config.maxAllowedLockedWithConvicition = getDecimal(
    maxAllowedLockedWithConvicition.toString(),
    chainDecimals
  );

  const filtered: VoteConvictionRequirements[] = votes.map((vote, i) => {
    const meetsRequirements = !(
      vote.lockedWithConviction.lt(minRequiredLockedWithConvicition) ||
      vote.lockedWithConviction.gt(maxAllowedLockedWithConvicition) ||
      (config.directOnly && vote.voteType === "Delegating") ||
      (config.first !== null && i > config.first)
    );

    const lockedWithConvictionDecimal = getDecimal(
      vote.lockedWithConviction.toString(),
      chainDecimals
    );

    return { ...vote, meetsRequirements, lockedWithConvictionDecimal };
  });

  return filtered;
};

/**
 * Retrieve account locks for the given votes and endBlock.
 * @param votes Array of ConvictionVote objects.
 * @param endBlock The block number to calculate locked balances.
 * @returns Array of VoteWithLock objects containing lockedWithConviction property.
 */
export const retrieveAccountLocks = async (
  votes: ConvictionVote[],
  endBlock: number,
  track: number
): Promise<VoteConviction[]> => {
  const api = await getApiAt("kusama", endBlock);
  const locks = [1, 10, 20, 30, 40, 50, 60];
  const lockPeriods = [0, 1, 2, 4, 8, 16, 32];
  const convictionOptions: string[] = [
    "None",
    "Locked1x",
    "Locked2x",
    "Locked3x",
    "Locked4x",
    "Locked5x",
    "Locked6x",
  ];
  const sevenDaysBlocks: BN = api.consts.convictionVoting.voteLockingPeriod;

  const endBlockBN = new BN(endBlock);
  const promises = votes.map(async (vote) => {
    let directLocks = await useAccountLocksImpl(
      api,
      "referenda",
      "convictionVoting",
      vote.address.toString()
    );

    // get userDelegations for this track
    const accountVotes = await api.query.convictionVoting?.votingFor(
      vote.address.toString(),
      track
    );

    const parsedAccountVotes = accountVotes.toJSON(); //as DelegatingData;
    const delegating = parsedAccountVotes?.delegating;

    let delegatedLock: Lock;
    if (delegating) {
      // Find the lock period corresponding to the conviction
      const convictionIndex = convictionOptions.indexOf(delegating.conviction);
      const lockPeriod = lockPeriods[convictionIndex];
      // Calculate the end block
      const endBlock: BN = sevenDaysBlocks
        .mul(new BN(lockPeriod))
        .add(endBlockBN);

      // Check if the balance is in hexadecimal format and convert if necessary
      let balanceValue = delegating.balance.toString();
      if (balanceValue.startsWith("0x")) {
        balanceValue = parseInt(balanceValue, 16).toString();
      }
      const total: BN = new BN(balanceValue);

      delegatedLock = { endBlock, total };
    }

    //add the delegationBalanceWithConviction
    const userLocks =
      delegatedLock?.endBlock && delegatedLock?.total
        ? [...directLocks, delegatedLock]
        : directLocks;

    const userLockedBalancesWithConviction = userLocks
      .filter(
        (userVote) =>
          userVote.endBlock.sub(endBlockBN).gte(new BN(0)) ||
          userVote.endBlock.eqn(0)
      )
      .map((userVote) => {
        const userLockPeriods = userVote.endBlock.eqn(0)
          ? 0
          : Math.floor(
            userVote.endBlock
              .sub(endBlockBN)
              .muln(10)
              .div(sevenDaysBlocks)
              .toNumber() / 10
          );
        const matchingPeriod = lockPeriods.reduce(
          (acc, curr, index) => (userLockPeriods >= curr ? index : acc),
          0
        );
        return userVote.total.muln(locks[matchingPeriod]).div(new BN(10));
      });

    const maxLockedWithConviction =
      userLockedBalancesWithConviction.length > 0
        ? userLockedBalancesWithConviction.reduce((max, current) =>
          BN.max(max, current)
        )
        : new BN(0);

    return { ...vote, lockedWithConviction: maxLockedWithConviction };
  });

  return await Promise.all(promises);
};

// Helper function to get locks
const getLocks = (
  api: ApiDecoration<"promise">,
  palletVote: PalletVote,
  votes: [
    classId: BN,
    refIds: BN[],
    casting: PalletConvictionVotingVoteCasting
  ][],
  referenda: [BN, PalletReferendaReferendumInfoConvictionVotingTally][]
): DirectVoteLock[] => {
  const lockPeriod = api.consts[palletVote].voteLockingPeriod as unknown as BN;
  const locks: DirectVoteLock[] = [];

  votes.forEach(([classId, , casting]) => {
    casting.votes.forEach(([refId, accountVote]) => {
      const refInfo = referenda.find(([id]) => id.eq(refId));

      if (refInfo) {
        const [, tally] = refInfo;
        let total: BN | undefined;
        let endBlock: BN | undefined;
        let conviction = 0;
        let locked = "None";

        // Process account vote based on its type
        if (accountVote.isStandard) {
          const { balance, vote } = accountVote.asStandard;
          total = balance;
          if (
            (tally.isApproved && vote.isAye) ||
            (tally.isRejected && vote.isNay)
          ) {
            conviction = vote.conviction.index;
            locked = vote.conviction.type;
          }
        } else if (accountVote.isSplit) {
          const { aye, nay } = accountVote.asSplit;
          total = aye.add(nay);
        } else if (accountVote.isSplitAbstain) {
          const { abstain, aye, nay } = accountVote.asSplitAbstain;
          total = aye.add(nay).add(abstain);
        } else {
          console.error(`Unable to handle ${accountVote.type}`);
        }

        // Calculate end block based on tally type
        if (tally.isOngoing) {
          endBlock = new BN(0);
        } else if (tally.isKilled) {
          endBlock = tally.asKilled;
        } else if (tally.isCancelled || tally.isTimedOut) {
          endBlock = tally.isCancelled
            ? tally.asCancelled[0]
            : tally.asTimedOut[0];
        } else if (tally.isApproved || tally.isRejected) {
          endBlock = lockPeriod
            .muln(conviction)
            .add(tally.isApproved ? tally.asApproved[0] : tally.asRejected[0]);
        } else {
          console.error(`Unable to handle ${tally.type}`);
        }

        if (total && endBlock) {
          locks.push({ classId, endBlock, locked, refId, total });
        }
      }
    });
  });

  return locks;
};

// Main function to get account locks
export async function useAccountLocksImpl(
  api: ApiDecoration<"promise">,
  palletReferenda: PalletReferenda,
  palletVote: PalletVote,
  accountId: string
): Promise<DirectVoteLock[]> {
  //@ts-ignore
  const locks: [BN, BN][] = await api.query[palletVote]?.classLocksFor(
    accountId
  );
  const lockClassesFormatted: BN[] = locks.map(([classId]) => classId);
  const voteParams: [[string, BN][]] = getVoteParams(
    accountId,
    lockClassesFormatted
  );
  let [params]: [[string, BN][]] = voteParams;
  // TODO
  const votes: PalletConvictionVotingVoteVoting[] =
    await api.query.convictionVoting?.votingFor.multi(params);
  const votesFormatted = votes
    .map((v, index): null | [BN, BN[], PalletConvictionVotingVoteCasting] => {
      if (!v.isCasting) {
        return null;
      }

      const casting = v.asCasting;

      return [params[index][1], casting.votes.map(([refId]) => refId), casting];
    })
    .filter((v): v is [BN, BN[], PalletConvictionVotingVoteCasting] => !!v);

  if (votesFormatted.length === 0) {
    return [];
  }
  const refParams: [BN[]] = getRefParams(votesFormatted);
  if (!refParams) {
    return [];
  }

  const [paramsref]: [BN[]] = refParams;
  const optTally: Option<PalletReferendaReferendumInfoConvictionVotingTally>[] =
    await api.query.referenda?.referendumInfoFor.multi(paramsref);

  const referendaFormatted = optTally
    .map(
      (
        v,
        index
        // TODO
      ): null | [BN, PalletReferendaReferendumInfoConvictionVotingTally] =>
        v.isSome ? [paramsref[index], v.unwrap()] : null
    )
    .filter(
      (v): v is [BN, PalletReferendaReferendumInfoConvictionVotingTally] => !!v
    );

  // Combine the referenda outcomes and the votes into locks
  return getLocks(api, palletVote, votesFormatted, referendaFormatted);
}

// TODO ------ are these still needed??

// Function to create a config NFT
export const createConfigNFT = async (
  apiPinata: PinataClient,
  config: RewardConfiguration
) => {
  const apiKusamaAssetHub = await getApiKusamaAssetHub();

  const txs = [];

  const account = initAccount();

  const nftId = generateNFTId(Date.now());

  const kusamaNetworkPrefix = await getNetworkPrefix("kusama");
  txs.push(
    apiKusamaAssetHub.tx.nfts.mint(
      config.configNFT.settingsCollectionId,
      nftId,
      encodeAddress(account.address, kusamaNetworkPrefix),
      null
    )
  );

  //add all attributes for all config variables other than the collectionConfig and options
  //filter out all attributes other tan the collectionConfig and options
  const { collectionConfig, configNFT, options, ...configAttributes } = config;

  //add attributes for all the non-nested config stuff
  for (const attribute in configAttributes) {
    if (attribute === "nftIds" && Array.isArray(configAttributes[attribute])) {
      // Convert the array to a string
      let ids = configAttributes[attribute].map((id) => id.toString());

      let counter = 1;
      let chunk = "";

      for (let id of ids) {
        // Check if adding the next ID would exceed 254 characters
        if (chunk.length + id.length + 1 > 254) {
          // Push the current chunk and reset it
          txs.push(
            apiKusamaAssetHub.tx.nfts.setAttribute(
              config.configNFT.settingsCollectionId,
              nftId,
              "CollectionOwner",
              attribute + "_" + counter,
              chunk.slice(0, -1) // Remove trailing comma
            )
          );
          chunk = "";
          counter++;
        }

        chunk += id + ",";
      }

      // Handle any remaining IDs
      if (chunk) {
        txs.push(
          apiKusamaAssetHub.tx.nfts.setAttribute(
            config.configNFT.settingsCollectionId,
            nftId,
            "CollectionOwner",
            attribute + "_" + counter,
            chunk.slice(0, -1) // Remove trailing comma
          )
        );
      }
    } else {
      txs.push(
        apiKusamaAssetHub.tx.nfts.setAttribute(
          config.configNFT.settingsCollectionId,
          nftId,
          "CollectionOwner",
          attribute,
          configAttributes.hasOwnProperty(attribute)
            ? configAttributes[attribute]?.toString() ?? ""
            : ""
        )
      );
    }
  }

  //add attributes for all the new collection config
  for (const attribute in collectionConfig) {
    txs.push(
      apiKusamaAssetHub.tx.nfts.setAttribute(
        config.configNFT.settingsCollectionId,
        nftId,
        "CollectionOwner",
        "collection_" + attribute,
        collectionConfig.hasOwnProperty(attribute)
          ? collectionConfig[attribute]?.toString() ?? ""
          : ""
      )
    );
  }

  //add attributes for all the configNFT stuff
  for (const attribute in configNFT) {
    txs.push(
      apiKusamaAssetHub.tx.nfts.setAttribute(
        config.configNFT.settingsCollectionId,
        nftId,
        "CollectionOwner",
        "configNFT_" + attribute,
        configNFT.hasOwnProperty(attribute)
          ? configNFT[attribute]?.toString() ?? ""
          : ""
      )
    );
  }

  let optionIndex = 0;
  //add attributes for all the reward options
  for (const option of options) {
    for (const attribute in option) {
      if (attribute === 'imageCid') {
        continue;
      }
      txs.push(
        apiKusamaAssetHub.tx.nfts.setAttribute(
          config.configNFT.settingsCollectionId,
          nftId,
          "CollectionOwner",
          "option_" + optionIndex + "_" + attribute,
          option.hasOwnProperty(attribute)
            ? option[attribute]?.toString() ?? ""
            : ""
        )
      );
    }
    optionIndex++;
  }

  // pin metadata and file for config NFT to Pinata
  const configMetadataCid = (await pinMetadataForConfigNFT(apiPinata, config))
    .metadataIpfsCid;

  config.configNFT.metadataCid = `ipfs://ipfs/${configMetadataCid}`;

  txs.push(
    apiKusamaAssetHub.tx.nfts.setMetadata(
      config.configNFT.settingsCollectionId,
      nftId,
      config.configNFT.metadataCid
    )
  );

  // fs.writeFileSync(
  //   `./log/tmp_config_transactions_${config.refIndex}_xcm.json`,
  //   JSON.stringify(
  //     txs.map((tx) => tx.toHuman()),
  //     null,
  //     2
  //   )
  // );

  const batch = apiKusamaAssetHub.tx.utility.batchAll(txs);

  //send transactions using our account
  const { block, hash, success } = await sendAndFinalizeKeyPair(
    apiKusamaAssetHub,
    batch,
    account
  );
  return success;
};

const fetchReputableVoters = async (
  params: FetchReputableVotersParams
): Promise<{
  countPerWallet: Record<string, number>;
  reputationLifetime: number;
}> => {
  const {
    confirmationBlockNumber,
    getEncointerBlockNumberFromKusama,
    getCurrentEncointerCommunities,
    getLatestEncointerCeremony,
    getReputationLifetime,
    getCeremonyAttendants,
  } = params;

  const encointerBlock = await getEncointerBlockNumberFromKusama(
    confirmationBlockNumber
  );
  const communities: EncointerCommunity[] =
    await getCurrentEncointerCommunities(encointerBlock);
  const currentCeremonyIndex = await getLatestEncointerCeremony(encointerBlock);
  const reputationLifetime = await getReputationLifetime(encointerBlock);

  const lowerIndex = Math.max(0, currentCeremonyIndex - reputationLifetime);
  let attendants = [];
  // for each community get latest 5 ceremony attendants
  for (const community of communities) {
    for (let cIndex = lowerIndex; cIndex < currentCeremonyIndex; cIndex++) {
      const unformattedAttendants = await getCeremonyAttendants(
        community,
        cIndex,
        encointerBlock
      );
      attendants.push(unformattedAttendants);
    }
  }
  const arrayOfReputables = attendants.flat();

  const countPerWallet = arrayOfReputables.reduce((elementCounts, element) => {
    elementCounts[element] = (elementCounts[element] || 0) + 1;
    return elementCounts;
  }, {});

  return { countPerWallet, reputationLifetime };
};

const getWalletsByDragonAge = (bonuses: Bonuses): Record<string, string[]> => {
  const dragonAges = ["babies", "toddlers", "adolescents", "adults"];
  const walletsByDragonAge: Record<string, string[]> = {};

  for (const age of dragonAges) {
    walletsByDragonAge[age] = bonuses[age].map(({ wallet }) => wallet);
  }

  return walletsByDragonAge;
};

const addDragonEquippedToVotes = (
  voteLocks: VoteConviction[],
  walletsByDragonAge: Record<string, string[]>
): VoteConvictionDragon[] => {
  return voteLocks.map((vote) => {
    let dragonEquipped: string;

    if (walletsByDragonAge.adults.includes(vote.address.toString())) {
      dragonEquipped = "Adult";
    } else if (
      walletsByDragonAge.adolescents.includes(vote.address.toString())
    ) {
      dragonEquipped = "Adolescent";
    } else if (walletsByDragonAge.toddlers.includes(vote.address.toString())) {
      dragonEquipped = "Toddler";
    } else if (walletsByDragonAge.babies.includes(vote.address.toString())) {
      dragonEquipped = "Baby";
    } else {
      dragonEquipped = "No";
    }

    return { ...vote, dragonEquipped };
  });
};

const createGraphQLClient = (url: string): GraphQLClient => {
  return new GraphQLClient(url);
};

const fetchQuizSubmissions = async (
  client: GraphQLClient,
  referendumIndex: string
): Promise<QuizSubmission[]> => {
  const queryQuizSubmissions = `
    query {
      quizSubmissions(where: {governanceVersion_eq: 2, referendumIndex_eq: ${referendumIndex}}) {
          blockNumber,
          quizId,
          timestamp,
          version,
          wallet,
          answers {
              isCorrect
          }
        }
    }
  `;

  try {
    const response = await client.request<{
      quizSubmissions: QuizSubmission[];
    }>(queryQuizSubmissions);
    return response.quizSubmissions;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const addQuizCorrectToVotes = (
  votesWithDragon: VoteConvictionDragon[],
  quizSubmissions: QuizSubmission[]
): VoteConvictionDragonQuiz[] => {
  return votesWithDragon.map((vote) => {
    const walletSubmissions = quizSubmissions.filter(
      (submission) => submission.wallet === vote.address
    );

    if (walletSubmissions.length == 0) {
      return { ...vote, quizCorrect: 0 };
    }

    const latestSubmission = walletSubmissions.reduce((latest, submission) => {
      return submission.blockNumber > latest.blockNumber ? submission : latest;
    }, walletSubmissions[0]);

    const someAnswersMissingCorrect = latestSubmission.answers.some(
      (answer) => answer.isCorrect === null || answer.isCorrect === undefined
    );

    if (someAnswersMissingCorrect) {
      // console.log("Some answers are missing correct answer")
      return { ...vote, quizCorrect: 0 };
    }

    const allAnswersCorrect = latestSubmission.answers.every(
      (answer) => answer.isCorrect
    );

    const quizCorrect = allAnswersCorrect ? 1 : 0;

    return { ...vote, quizCorrect };
  });
};

const addEncointerScoreToVotes = (
  votesWithDragonAndQuiz: VoteConviction[],
  countPerWallet: Record<string, number>
): VoteConvictionEncointer[] => {
  return votesWithDragonAndQuiz.map((vote) => {
    const encointerScore = countPerWallet[vote.address];
    return { ...vote, encointerScore: encointerScore ? encointerScore : 0 };
  });
};

const checkCollectionExists = async (
  api: ApiPromise,
  collectionId: BN
): Promise<boolean> => {
  try {
    const collection = await api.query.uniques.collection(collectionId);
    return !collection.isEmpty;
  } catch (error) {
    console.error(`Failed to check collection: ${error}`);
    return false;
  }
};

// /**
//  * Given a config it will return an object with all the NFT attributes that can be used either in `setAttribute` calls or in the metadata.
//  * @param config
//  * @param filter
//  */
// export function getSendoutNFTAttributes(
//   config: RewardConfiguration,
//   vote: VoteConviction,
//   imageCid: string,
//   filter: string[],
//   rng: RNG
// ): any {
//   const { refIndex: referendumIndex } = config;
//   const { chosenOption } = vote;

//   // const randRoyaltyInRange = Math.floor(
//   //   rng() * (chosenOption.maxRoyalty - chosenOption.minRoyalty + 1) +
//   //     chosenOption.minRoyalty
//   // );

//   let recipientValue;
//   if (config.royaltyAddress === websiteConfig.royaltyAddress) {
//     recipientValue = [[config.royaltyAddress, 100]];
//   } else {
//     recipientValue = [
//       [config.royaltyAddress, 80],
//       [websiteConfig.royaltyAddress, 20],
//     ];
//   }

//   const allAttributes = {
//     image: imageCid,
//     referendum: referendumIndex,
//     meetsRequirements: vote.meetsRequirements,
//     voter: vote.address.toString(),
//     amountLockedInGovernance: vote.lockedWithConvictionDecimal,
//     voteDirection: vote.voteDirection,
//     delegatedConvictionBalance: vote.delegatedConvictionBalance.toString(),
//     delegatedTo: vote.delegatedTo?.toString(),
//     royalty: vote.meetsRequirements
//       ? chosenOption.royalty
//       : config.defaultRoyalty,
//     recipient: recipientValue,
//     aye: vote.balance.aye.toString(),
//     nay: vote.balance.nay.toString(),
//     abstain: vote.balance.abstain.toString(),
//     chanceAtEpic: vote.chances.epic.toString(),
//     chanceAtRare: vote.chances.rare.toString(),
//     chanceAtCommon: vote.chances.common.toString(),
//     dragonEquipped: vote.dragonEquipped,
//     quizCorrect: vote.quizCorrect.toString(),
//     encointerScore: vote.encointerScore,
//     // TODO this was rmrk style ?
//     // royaltyPercentFloat: vote.meetsRequirements ? randRoyaltyInRange : 0,
//     // royaltyReceiver: config.royaltyAddress,
//   };

//   const filteredAttributes = pick(allAttributes, filter);

//   return filteredAttributes;
// }
