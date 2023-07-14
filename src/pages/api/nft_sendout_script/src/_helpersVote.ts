import seedrandom from "seedrandom";
import type { Option } from "@polkadot/types";
import type {
  PalletConvictionVotingVoteCasting,
  PalletConvictionVotingVoteVoting,
  PalletReferendaReferendumInfoConvictionVotingTally,
} from "@polkadot/types/lookup";
import { BN, bnToBn } from "@polkadot/util";
import type {
  Lock,
  PalletReferenda,
  PalletVote,
  ConvictionVote,
  VoteConviction,
  RewardConfiguration,
  VoteConvictionRequirements,
  Uniqs,
  RarityDistribution,
} from "../types.js";
import { ApiDecoration } from "@polkadot/api/types";
import { getApiAt, getDecimal } from "../tools/substrateUtils";
import { getConvictionVoting } from "./voteData";
import { lucksForConfig, weightedRandom } from "../../../../utils";
import { Logger } from "log4js";
import { Uniqs } from "../types";

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
  return votes;
};

/**
 * Given a referendum index, gets all the votes for that referendum. Also adds annotations that are relevant for the sendout script like the luckbonus and the finally received nft rarity.
 * @param referendumIndex
 * @returns
 */
export const getDecoratedVotesWithInfo = async (
  config: RewardConfiguration,
  chainDecimals: BN,
  logger: Logger
): Promise<{ decoratedVotes: VoteConviction[]; distribution: Uniqs }> => {
  let { referendum, totalIssuance, votes } = await getConvictionVoting(
    parseInt(config.refIndex)
  );

  // start decorating the votes with additional information
  // TODO rename all below to decorateWith...

  // 1. decorate `lockedWithConviction` - relevant info we consider instead of the vote * locked
  votes = await retrieveAccountLocks(votes, referendum.confirmationBlockNumber);

  // 2. decorate with bonuses
  votes = applyBonusesFor("encointer", votes);
  votes = applyBonusesFor("dragon", votes);
  votes = applyBonusesFor("quiz", votes);

  // 3. decorate `meetsRequirements` - whether vote > threshold
  votes = await checkVotesMeetingRequirements(
    votes,
    totalIssuance,
    config,
    chainDecimals
  );

  // 4. get global min, max, median values for calculating the final rarity
  const {
    votesMeetingRequirements,
    votesNotMeetingRequirements,
    minVoteValue,
    maxVoteValue,
    medianVoteValue,
  } = getVoteInfo(votes, config);

  logger.info(
    `AAA Total votes: ${votes.length}, votes meeting requirements: ${votesMeetingRequirements.length}, votes not meeting requirements: ${votesNotMeetingRequirements.length}`
  );
  logger.info(
    `AAA Min vote value: ${minVoteValue}, max vote value: ${maxVoteValue}, median vote value: ${medianVoteValue}`
  );

  // 5. decorate with chances. E.g. chances: { common: 0.5, rare: 0.3, epic 0.2}

  const decoratedWithChancesVotes = decorateWithChances(
    votes,
    config,
    minVoteValue,
    maxVoteValue,
    medianVoteValue
  );
  votes = decoratedWithChancesVotes.votesWithChances;

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
  minVoteValue: number,
  maxVoteValue: number,
  medianVoteValue: number,
  seed: number = 0
): { votesWithChances: VoteConviction[]; distribution: RarityDistribution } => {
  //seed the randomizer
  const rng = seedrandom(seed.toString());

  config.minValue = minVoteValue;
  config.maxValue = maxVoteValue;
  config.median = medianVoteValue;

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
    console.info(`invariant holds for ${JSON.stringify(rarityDistribution)}`);
    return { votesWithChances, distribution: rarityDistribution };
  } else {
    console.info(
      `invariant does not hold for ${JSON.stringify(
        rarityDistribution
      )} retrying with seed ${seed + 1}...`
    );
    return decorateWithChances(
      votes,
      config,
      minVoteValue,
      maxVoteValue,
      medianVoteValue,
      ++seed
    );
  }
};

const getVoteInfo = (
  votes: VoteConviction[],
  config: RewardConfiguration
): {
  votesMeetingRequirements: VoteConviction[];
  votesNotMeetingRequirements: VoteConviction[];
  minVoteValue: number;
  maxVoteValue: number;
  medianVoteValue: number;
} => {
  const votesMeetingRequirements = votes.filter((vote) => {
    return vote.meetsRequirements;
  });

  const votesNotMeetingRequirements = votes.filter((vote) => {
    return !vote.meetsRequirements;
  });

  const minVoteValue = votesMeetingRequirements.reduce((prev, curr) =>
    prev.lockedWithConviction.lt(curr.lockedWithConviction) ? prev : curr
  )?.lockedWithConviction;

  const maxVoteValue = votesMeetingRequirements.reduce((prev, curr) =>
    prev.lockedWithConviction.gt(curr.lockedWithConviction) ? prev : curr
  )?.lockedWithConviction;

  // Get the median and normalize min vote to threshold
  const threshold = config.minAmount;
  const { minValue, maxValue, median } = getMinMaxMedian(
    votesMeetingRequirements.map((vote) => vote.lockedWithConvictionDecimal),
    threshold
  );

  return {
    votesMeetingRequirements,
    votesNotMeetingRequirements,
    minVoteValue: minValue,
    maxVoteValue: maxValue,
    medianVoteValue: median,
  };
};

/**
 * Calculate the minimum, maximum, and median values of an array of vote amounts, considering only those above a critical value.
 * @param voteAmounts An array of vote amounts.
 * @param criticalValue The critical value to filter the vote amounts.
 * @returns An object containing the minimum, maximum, and median values.
 */
export const getMinMaxMedian = (
  voteAmounts: number[],
  criticalValue: number
): { minValue: number; maxValue: number; median: number } => {
  if (voteAmounts.length < 4) {
    return {
      minValue: Math.min(...voteAmounts),
      maxValue: Math.max(...voteAmounts),
      median: voteAmounts[Math.floor(voteAmounts.length / 2)],
    };
  }

  const filteredVotes = voteAmounts.filter((vote) => vote > criticalValue);

  let values, q1, q3, iqr, maxValue, minValue, median;

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
  maxValue = q3 + iqr * 1.5;
  minValue = Math.max(q1 - iqr * 1.5, criticalValue);

  return { minValue, maxValue, median };
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
  const minVote = BN.max(new BN(config.min), new BN("0"));
  const maxVote = BN.min(new BN(config.max), new BN(totalIssuance));

  config.minVote = getDecimal(minVote.toString(), chainDecimals);
  config.maxVote = getDecimal(maxVote.toString(), chainDecimals);

  const filtered: VoteConvictionRequirements[] = votes.map((vote, i) => {
    const meetsRequirements = !(
      vote.lockedWithConviction.lt(minVote) ||
      vote.lockedWithConviction.gt(maxVote) ||
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
  endBlock: number
): Promise<VoteConviction[]> => {
  const api = await getApiAt("kusama", endBlock);
  const LOCKS = [1, 10, 20, 30, 40, 50, 60];
  const LOCKPERIODS = [0, 1, 2, 4, 8, 16, 32];
  const sevenDaysBlocks = api.consts.convictionVoting.voteLockingPeriod;

  const endBlockBN = new BN(endBlock);
  const promises = votes.map(async (vote) => {
    const userVotes = await useAccountLocksImpl(
      api,
      "referenda",
      "convictionVoting",
      vote.address.toString()
    );

    const userLockedBalancesWithConviction = userVotes
      .filter(
        (userVote) =>
          userVote.endBlock.sub(endBlockBN).gte(new BN(0)) ||
          userVote.endBlock.eqn(0)
      )
      .map((userVote) => {
        const lockPeriods = userVote.endBlock.eqn(0)
          ? 0
          : Math.floor(
              userVote.endBlock
                .sub(endBlockBN)
                .muln(10)
                .div(sevenDaysBlocks)
                .toNumber() / 10
            );
        const matchingPeriod = LOCKPERIODS.reduce(
          (acc, curr, index) => (lockPeriods >= curr ? index : acc),
          0
        );
        return userVote.total.muln(LOCKS[matchingPeriod]).div(new BN(10));
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
): Lock[] => {
  const lockPeriod = api.consts[palletVote].voteLockingPeriod as BN;
  const locks: Lock[] = [];

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
): Promise<Lock[]> {
  const locks: [BN, BN][] = await api.query.convictionVoting?.classLocksFor(
    accountId
  );
  const lockClassesFormatted: BN[] = locks.map(([classId]) => classId);
  const voteParams: [[string, BN][]] = getVoteParams(
    accountId,
    lockClassesFormatted
  );
  let [params]: [[string, BN][]] = voteParams;
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
      ): null | [BN, PalletReferendaReferendumInfoConvictionVotingTally] =>
        v.isSome ? [paramsref[index], v.unwrap()] : null
    )
    .filter(
      (v): v is [BN, PalletReferendaReferendumInfoConvictionVotingTally] => !!v
    );

  // Combine the referenda outcomes and the votes into locks
  return getLocks(api, palletVote, votesFormatted, referendaFormatted);
}
