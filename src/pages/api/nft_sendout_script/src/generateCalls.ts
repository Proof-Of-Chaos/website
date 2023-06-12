import seedrandom from "seedrandom";
import { BN } from "@polkadot/util";
import { pinSingleMetadataFromDir } from "../tools/pinataUtils";
import fs from "fs";
import { logger } from "../tools/logger";
import {
  ConvictionVote,
  EncointerCommunity,
  QuizSubmission,
  RNG,
  VoteConviction,
  VoteConvictionDragon,
  VoteConvictionDragonQuiz,
  VoteConvictionDragonQuizEncointer,
  VoteConvictionRequirements,
  Uniqs,
  ProcessMetadataResult,
  FetchReputableVotersParams,
  Bonuses,
  RewardConfiguration,
  RewardOption,
} from "../types.js";
import {
  getApiAt,
  getApiKusama,
  getApiStatemine,
  getDecimal,
} from "../tools/substrateUtils";
import { getDragonBonusFile } from "../tools/utils";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { createNewCollection } from "./createNewCollection";
import { useAccountLocksImpl } from "./accountLocks";
import pinataSDK, { PinataClient } from "@pinata/sdk";
import { getConvictionVoting } from "./voteData";
import { GraphQLClient } from "graphql-request";
import { ApiPromise } from "@polkadot/api";
import {
  getCeremonyAttendants,
  getCurrentEncointerCommunities,
  getEncointerBlockNumberFromKusama,
  getLatestEncointerCeremony,
  getReputationLifetime,
} from "./encointerData";

/**
 * Retrieve account locks for the given votes and endBlock.
 * @param votes Array of ConvictionVote objects.
 * @param endBlock The block number to calculate locked balances.
 * @returns Array of VoteWithLock objects containing lockedWithConviction property.
 */
const retrieveAccountLocks = async (
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

/**
 * Check if votes meet the specified requirements.
 * @param votes Array of VoteConvictionDragon objects.
 * @param totalIssuance Total issuance as a string.
 * @param config Configuration object with min, max, directOnly, and first properties.
 * @returns Array of VoteCheckResult objects containing meetsRequirements property.
 */
const checkVotesMeetingRequirements = async (
  votes: VoteConvictionDragonQuizEncointer[],
  totalIssuance: string,
  config: RewardConfiguration
): Promise<VoteConvictionRequirements[]> => {
  const minVote = BN.max(new BN(config.min), new BN("0"));
  const maxVote = BN.min(new BN(config.max), new BN(totalIssuance));

  config.minVote = await getDecimal(minVote.toString());
  config.maxVote = await getDecimal(maxVote.toString());

  const filtered: VoteConvictionRequirements[] = votes.map((vote, i) => {
    const meetsRequirements = !(
      vote.lockedWithConviction.lt(minVote) ||
      vote.lockedWithConviction.gt(maxVote) ||
      (config.directOnly && vote.voteType === "Delegating") ||
      (config.first !== null && i > config.first)
    );

    return { ...vote, meetsRequirements };
  });

  return filtered;
};

/**
 * Returns a random index based on the given weights.
 * @param rng - A random number generator function.
 * @param weights - An array of weights corresponding to each index.
 * @returns A randomly selected index, with a higher probability for indices with higher weights.
 */
const getRandom = (rng: RNG, weights: number[]): number => {
  // Generate a random number using the provided rng function
  const num = rng();
  let sum = 0;
  const lastIndex = weights.length - 1;

  // Iterate through the weights array
  for (let i = 0; i < lastIndex; ++i) {
    // Update the sum with the current weight
    sum += weights[i];

    // If the random number is less than the sum, return the current index
    if (num < sum) {
      return i;
    }
  }

  // If none of the previous conditions were met, return the last index
  return lastIndex;
};

/**
 * Calculate luck value based on various factors.
 *
 * @param n - The initial luck value.
 * @param minIn - The minimum input value.
 * @param maxIn - The maximum input value.
 * @param minOut - The minimum output value.
 * @param maxOut - The maximum output value.
 * @param exponent - The exponent value for scaling.
 * @param babyBonus - The bonus for baby dragons.
 * @param toddlerBonus - The bonus for toddler dragons.
 * @param adolescentBonus - The bonus for adolescent dragons.
 * @param adultBonus - The bonus for adult dragons.
 * @param quizBonus - The bonus for quiz correctness.
 * @param encointerBonus - The bonus for encointer score.
 * @param dragonEquipped - The type of dragon equipped.
 * @param quizCorrect - Whether the quiz was answered correctly.
 * @param encointerScore - The encointer score.
 * @returns - A Promise that resolves to the calculated luck value.
 */
const calculateLuck = async (
  voteAmountWithConviction: string,
  minIn: number,
  maxIn: number,
  minOut: number,
  maxOut: number,
  exponent: number,
  babyBonus: number,
  toddlerBonus: number,
  adolescentBonus: number,
  adultBonus: number,
  quizBonus: number,
  encointerBonus: number,
  dragonEquipped: string,
  quizCorrect: number,
  encointerScore: number,
  reputationLifetime: number
): Promise<string> => {
  let n = await getDecimal(voteAmountWithConviction);
  minOut = parseInt(minOut.toString());
  maxOut = parseInt(maxOut.toString());
  if (n > maxIn) {
    n = maxOut;
  } else if (n < minIn) {
    n = minOut;
  } else {
    // Unscale input
    n -= minIn;
    n /= maxIn - minIn;
    n = Math.pow(n, exponent);

    // Scale output
    n *= maxOut - minOut;
    n += minOut;
  }

  // Check if dragon bonus
  switch (dragonEquipped) {
    case "Adult":
      n = n * (1 + adultBonus / 100);
      break;
    case "Adolescent":
      n = n * (1 + adolescentBonus / 100);
      break;
    case "Toddler":
      n = n * (1 + toddlerBonus / 100);
      break;
    case "Baby":
      n = n * (1 + babyBonus / 100);
      break;
    case "No":
      // No change
      break;
  }

  if (quizCorrect) {
    n = n * (1 + quizBonus / 100);
  }

  const maxEncointerScore = reputationLifetime;
  const base = 2; // Change this value to adjust the exponential factor

  let bonus: number;

  if (encointerScore) {
    if (encointerScore < 0 || encointerScore > reputationLifetime) {
      throw new Error(`Score must be between 0 and ${reputationLifetime}`);
    }
    if (encointerScore === maxEncointerScore) {
      bonus =
        (encointerBonus / 100) *
        Math.pow(base, maxEncointerScore - encointerScore);
      n = n * (1 + bonus);
    } else {
      bonus =
        (encointerBonus / 100) *
        Math.pow(base, maxEncointerScore - encointerScore - 1);
      n = n * (1 + bonus);
    }
  }
  return n.toFixed(2);
};

/**
 * Calculate the minimum, maximum, and median values of an array of vote amounts, considering only those above a critical value.
 * @param voteAmounts An array of vote amounts.
 * @param criticalValue The critical value to filter the vote amounts.
 * @returns An object containing the minimum, maximum, and median values.
 */
const getMinMaxMedian = (
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
  minValue = Math.max(q1 - iqr * 1.5, 0);

  return { minValue, maxValue, median };
};

// Function to generate attributes for direct and delegated options
const generateAttributes = (
  option: RewardOption,
  typeOfVote: string,
  totalSupplyOfOption: number
): { name: string; value: string | number }[] => {
  return [
    { name: "rarity", value: option.rarity },
    { name: "totalSupply", value: totalSupplyOfOption },
    { name: "artist", value: option.artist },
    { name: "creativeDirector", value: option.creativeDirector },
    { name: "name", value: option.itemName },
    { name: "typeOfVote", value: typeOfVote },
  ];
};

// Function to process metadata for each option
const processMetadataForOptions = async (
  config: RewardConfiguration,
  pinata: ReturnType<typeof pinataSDK>,
  referendumIndex: BN,
  uniqs: Uniqs
): Promise<ProcessMetadataResult> => {
  const metadataCids = [];
  const attributes = [];

  for (const option of config.options) {
    const attributesDirect = generateAttributes(
      option,
      "direct",
      uniqs[config.options.indexOf(option).toString()]
    );
    const metadataCidDirect = await pinSingleMetadataFromDir(
      pinata,
      "/public/referenda",
      option.main,
      `Referendum ${referendumIndex}`,
      { description: option.text }
    );
    option.metadataCidDirect = metadataCidDirect;

    const attributesDelegated = generateAttributes(
      option,
      "delegated",
      uniqs[config.options.indexOf(option).toString()]
    );
    const metadataCidDelegated = await pinSingleMetadataFromDir(
      pinata,
      "/public/referenda",
      option.main,
      `Referendum ${referendumIndex}`,
      { description: option.text }
    );
    option.metadataCidDelegated = metadataCidDelegated;

    if (!metadataCidDirect || !metadataCidDelegated) {
      logger.error(
        `one of metadataCids is null: dir: ${metadataCidDirect} del: ${metadataCidDelegated}. exiting.`
      );
      return;
    }

    metadataCids.push([metadataCidDirect, metadataCidDelegated]);
    attributes.push([attributesDirect, attributesDelegated]);
  }
  return { metadataCids, attributes };
};

// Function to create transactions for each mapped vote
const createTransactionsForVotes = async (
  apiStatemine,
  config,
  metadataCids,
  attributes,
  selectedIndexArray,
  mappedVotes,
  chances,
  rng,
  referendumIndex,
  proxyWallet
) => {
  const txs = [];
  for (let i = 0; i < mappedVotes.length; i++) {
    let usedMetadataCids: string[] = [];
    let selectedOptions = [];

    const vote = mappedVotes[i];
    const selectedOption = config.options[selectedIndexArray[i]];
    selectedOptions.push(selectedOption);
    const selectedMetadata = metadataCids[selectedIndexArray[i]];

    let metadataCid =
      vote.voteType == "Delegating" ? selectedMetadata[1] : selectedMetadata[0];
    const randRoyaltyInRange = Math.floor(
      rng() * (selectedOption.maxRoyalty - selectedOption.minRoyalty + 1) +
      selectedOption.minRoyalty
    );
    if (!metadataCid) {
      logger.error(`metadataCid is null. exiting.`);
      return;
    }
    usedMetadataCids.push(metadataCid);
    // if (vote.address.toString() == "FF4KRpru9a1r2nfWeLmZRk6N8z165btsWYaWvqaVgR6qVic") {
    txs.push(
      apiStatemine.tx.uniques.mint(config.newCollectionSymbol, i, proxyWallet)
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "royaltyPercentFloat",
        vote.meetsRequirements ? randRoyaltyInRange : config.defaultRoyalty
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "royaltyReceiver",
        "DhvRNnnsyykGpmaa9GMjK9H4DeeQojd5V5qCTWd1GoYwnTc"
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "amountLockedInGovernance",
        await getDecimal(vote.lockedWithConviction.toString())
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "voteDirection",
        vote.voteDirection
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "aye",
        vote.balance.aye.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "nay",
        vote.balance.nay.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "abstain",
        vote.balance.abstain.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "delegatedConvictionBalance",
        vote.delegatedConvictionBalance.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "chanceAtEpic",
        chances[i].epic.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "chanceAtRare",
        chances[i].rare.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "chanceAtCommon",
        chances[i].common.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "wallet",
        vote.address.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "dragonEquipped",
        vote.dragonEquipped
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "quizCorrect",
        vote.quizCorrect.toString()
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "encointerScore",
        vote.encointerScore
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "referendumIndex",
        referendumIndex
      )
    );
    txs.push(
      apiStatemine.tx.uniques.setAttribute(
        config.newCollectionSymbol,
        i,
        "meetsRequirements",
        vote.meetsRequirements
      )
    );
    for (const attribute of vote.voteType == "Delegating"
      ? attributes[selectedIndexArray[i]][1]
      : attributes[selectedIndexArray[i]][0]) {
      txs.push(
        apiStatemine.tx.uniques.setAttribute(
          config.newCollectionSymbol,
          i,
          attribute.name,
          attribute.value
        )
      );
    }
    txs.push(
      apiStatemine.tx.uniques.setMetadata(
        config.newCollectionSymbol,
        i,
        metadataCid,
        true
      )
    );
    txs.push(
      apiStatemine.tx.uniques.transfer(
        config.newCollectionSymbol,
        i,
        vote.address.toString()
      )
    );
  }

  return txs;
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
      console.log("Some answers are missing correct answer");
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
  votesWithDragonAndQuiz: VoteConvictionDragonQuiz[],
  countPerWallet: Record<string, number>
): VoteConvictionDragonQuizEncointer[] => {
  return votesWithDragonAndQuiz.map((vote) => {
    const encointerScore = countPerWallet[vote.address];
    return { ...vote, encointerScore: encointerScore ? encointerScore : 0 };
  });
};

const getBlockNumber = async (apiKusama: ApiPromise, referendumIndex: BN): Promise<BN | null> => {
  try {
    const info = await apiKusama.query.referenda.referendumInfoFor(referendumIndex);
    const trackJSON = info.toJSON();

    if (
      trackJSON["approved"] ||
      trackJSON["cancelled"] ||
      trackJSON["rejected"] ||
      trackJSON["timedOut"]
    ) {
      let status, confirmationBlockNumber;
      if (trackJSON["approved"]) {
        confirmationBlockNumber = trackJSON["approved"][0];
        status = "Approved";
      } else if (trackJSON["cancelled"]) {
        confirmationBlockNumber = trackJSON["cancelled"][0];
        status = "Cancelled";
      } else if (trackJSON["rejected"]) {
        confirmationBlockNumber = trackJSON["rejected"][0];
        status = "Rejected";
      } else if (trackJSON["timedOut"]) {
        confirmationBlockNumber = trackJSON["timedOut"][0];
        status = "TimedOut";
      }
      return confirmationBlockNumber;
    }
    else {
      logger.error(`Referendum is still ongoing.`);
      return null;
    }
  } catch (e) {
    logger.error(`Failed to get referendum info: ${e}`);
    return null;
  }
}



const setupPinata = async (): Promise<PinataClient | null> => {
  const pinata = pinataSDK(
    process.env.PINATA_API,
    process.env.PINATA_SECRET
  );
  try {
    const result = await pinata.testAuthentication();
    logger.info(result);
    return pinata;
  } catch (err) {
    logger.info(err);
    return null;
  }
};

export const generateCalls = async (
  config: RewardConfiguration,
  seed: number = 0
): Promise<string> => {
  await cryptoWaitReady();

  console.log("🎉🎉🎉 We got the config", config);

  const referendumIndex = new BN(config.refIndex);
  let apiKusama = await getApiKusama();
  let apiStatemine = await getApiStatemine();
  const rng = seedrandom(seed.toString()); //add secret seed?

  const blockNumber = await getBlockNumber(apiKusama, referendumIndex);
  if (!blockNumber) return;

  const pinata = await setupPinata();
  if (!pinata) return;

  const { referendum, totalIssuance, votes } = await getConvictionVoting(99);
  logger.info("Number of votes: ", votes.length);

  const voteLocks = await retrieveAccountLocks(
    votes,
    referendum.confirmationBlockNumber
  );

  const { countPerWallet, reputationLifetime } = await fetchReputableVoters({
    confirmationBlockNumber: referendum.confirmationBlockNumber,
    getEncointerBlockNumberFromKusama: getEncointerBlockNumberFromKusama,
    getCurrentEncointerCommunities: getCurrentEncointerCommunities,
    getLatestEncointerCeremony: getLatestEncointerCeremony,
    getReputationLifetime: getReputationLifetime,
    getCeremonyAttendants: getCeremonyAttendants,
  });

  //apply encointer bonus
  let bonusFile = await getDragonBonusFile(referendumIndex);
  if (bonusFile === "") {
    return;
  }
  let bonuses = await JSON.parse(bonusFile);
  // check that bonusFile is from correct block
  if (bonuses.block != blockNumber) {
    logger.info(`Wrong Block in Bonus File. Exiting.`);
    return;
  }

  const walletsByDragonAge = getWalletsByDragonAge(bonuses);
  const votesWithDragon = addDragonEquippedToVotes(
    voteLocks,
    walletsByDragonAge
  );

  const client = createGraphQLClient(
    "https://squid.subsquid.io/referenda-dashboard/v/0/graphql"
  );
  const quizSubmissions = await fetchQuizSubmissions(
    client,
    referendum.index.toString()
  );

  const votesWithDragonAndQuiz = addQuizCorrectToVotes(
    votesWithDragon,
    quizSubmissions
  );
  const votesWithDragonAndQuizAndEncointer = addEncointerScoreToVotes(
    votesWithDragonAndQuiz,
    countPerWallet
  );

  const mappedVotes: VoteConvictionRequirements[] =
    await checkVotesMeetingRequirements(
      votesWithDragonAndQuizAndEncointer,
      totalIssuance.toString(),
      config
    );

  const votesMeetingRequirements = mappedVotes.filter((vote) => {
    return vote.meetsRequirements;
  });

  logger.info(
    `${votesMeetingRequirements.length} votes meeting the requirements.`
  );

  const votesNotMeetingRequirements = mappedVotes.filter((vote) => {
    return !vote.meetsRequirements;
  });

  logger.info(
    `${votesNotMeetingRequirements.length} votes not meeting the requirements.`
  );

  let allChances = [];
  const minVote = votesMeetingRequirements.reduce((prev, curr) =>
    prev.lockedWithConviction.lt(curr.lockedWithConviction) ? prev : curr
  );
  const maxVote = votesMeetingRequirements.reduce((prev, curr) =>
    prev.lockedWithConviction.gt(curr.lockedWithConviction) ? prev : curr
  );
  logger.info("minVote", minVote.lockedWithConviction.toString());
  logger.info("maxVote", maxVote.lockedWithConviction.toString());
  const promises = votesMeetingRequirements.map(async (vote) => {
    return await getDecimal(vote.lockedWithConviction.toString());
  });
  const voteAmounts = await Promise.all(promises);
  let { minValue, maxValue, median } = getMinMaxMedian(
    voteAmounts,
    config.minAmount
  );
  minValue = Math.max(
    minValue,
    await getDecimal(minVote.lockedWithConviction.toString())
  );
  config.minValue = Math.max(minValue, config.minAmount);
  logger.info("minValue", minValue);
  config.maxValue = maxValue;
  logger.info("maxValue", maxValue);
  config.median = median;
  logger.info("median", median);
  let selectedIndexArray = [];
  for (const vote of mappedVotes) {
    let chance;
    let selectedIndex;
    let zeroOrOne;
    let counter = 0;
    let chances = {};
    if (vote.meetsRequirements) {
      for (const option of config.options) {
        if (counter < config.options.length - 1) {
          if (
            (await getDecimal(vote.lockedWithConviction.toString())) < median
          ) {
            chance = await calculateLuck(
              vote.lockedWithConviction.toString(),
              minValue,
              median,
              option.minProbability,
              (option.maxProbability + option.minProbability) / 2,
              3,
              config.babyBonus,
              config.toddlerBonus,
              config.adolescentBonus,
              config.adultBonus,
              config.quizBonus,
              config.encointerBonus,
              vote.dragonEquipped,
              vote.quizCorrect,
              vote.encointerScore,
              reputationLifetime
            );
          } else {
            chance = await calculateLuck(
              vote.lockedWithConviction.toString(),
              median,
              maxValue,
              (option.maxProbability + option.minProbability) / 2,
              option.maxProbability,
              0.4,
              config.babyBonus,
              config.toddlerBonus,
              config.adolescentBonus,
              config.adultBonus,
              config.quizBonus,
              config.encointerBonus,
              vote.dragonEquipped,
              vote.quizCorrect,
              vote.encointerScore,
              reputationLifetime
            );
          }
          zeroOrOne = getRandom(rng, [chance / 100, (100 - chance) / 100]);
          if (zeroOrOne === 0 && selectedIndex == null) {
            selectedIndex = counter;
          }
        }

        if (counter === config.options.length - 1) {
          chances[option.rarity] = 100 - chance;
          if (selectedIndex == null) {
            selectedIndex = counter;
          }
        } else {
          chances[option.rarity] = chance;
        }
        counter++;
      }
      allChances.push(chances);
      selectedIndexArray.push(selectedIndex);
    } else {
      const commonIndex = config.options.length - 1;
      const chances = { epic: 0, rare: 0, common: 100 };
      allChances.push(chances);
      selectedIndexArray.push(commonIndex);
    }
  }
  var uniqs = selectedIndexArray.reduce((acc, val) => {
    acc[val] = acc[val] === undefined ? 1 : (acc[val] += 1);
    return acc;
  }, {});

  logger.info(uniqs);
  if (!(uniqs['2'] > uniqs['1'] * 4 && uniqs['1'] > uniqs['0'] * 2)) {
    logger.info('Running again')
    return generateCalls(config, ++seed)
  } 
  

  let itemCollectionId;
  //create collection if required
  config.newCollectionMetadataCid = "";
  let txs = [];
  const proxyWallet = "D3iNikJw3cPq6SasyQCy3k4Y77ZeecgdweTWoSegomHznG3";
  const proxyWalletSignature = {
    system: {
      Signed: proxyWallet,
    },
  };
  const proxyWalletAdmin = {
    Id: proxyWallet,
  };
  if (config.createNewCollection) {
    txs.push(
      apiStatemine.tx.uniques.create(config.newCollectionSymbol, proxyWallet)
    );
    config.newCollectionMetadataCid = await createNewCollection(pinata, config);
    txs.push(
      apiStatemine.tx.uniques.setCollectionMetadata(
        config.newCollectionSymbol,
        config.newCollectionMetadataCid,
        true
      )
    );
    // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.create(config.newCollectionSymbol, proxyWallet)))
    // config.newCollectionMetadataCid = await createNewCollection(pinata, account.address, config);
    // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.setCollectionMetadata(config.newCollectionSymbol, config.newCollectionMetadataCid, false)))
  } else {
    // use a default collection
  }
  logger.info("collectionID Item: ", itemCollectionId);

  const { metadataCids, attributes } = await processMetadataForOptions(
    config,
    pinata,
    referendumIndex,
    uniqs
  );
  logger.info("metadataCids", metadataCids);
  // Create transactions for each mapped vote
  txs.push(
    ...(await createTransactionsForVotes(
      apiStatemine,
      config,
      metadataCids,
      attributes,
      selectedIndexArray,
      mappedVotes,
      allChances,
      rng,
      referendumIndex.toString(),
      proxyWallet
    ))
  );
  const batchtx = apiStatemine.tx.utility.batchAll(txs).toHex();
  // fs.writeFile(`assets/output/${referendumIndex}.json`, batchtx, (err) => {
  //   // In case of a error throw err.
  //   if (err) throw err;
  // });
  // console.log(apiStatemine.tx.utility.batch(txs).toHex())
  const dest = {
    V1: {
      interior: {
        X1: {
          parachain: 1000,
        },
      },
    },
  };
  const message = {
    V2: {
      0: {
        transact: {
          call: batchtx,
          originType: "Superuser",
          require_weight_at_most: 1000000000,
        },
      },
    },
  };
  // const finalCall = apiKusama.tx.xcmPallet.send(dest, message)
  // fs.writeFile(`assets/output/1.json`, JSON.stringify(finalCall), (err) => {
  //     // In case of a error throw err.
  //     if (err) throw err;
  // })

  let distributionAndConfigRemarks = [];
  logger.info("Writing Distribution and Config to Chain");
  return JSON.stringify(batchtx);

  //write distribution to chain
  // distributionAndConfigRemarks.push('PROOFOFCHAOS2::' + referendumIndex.toString() + '::DISTRIBUTION::' + JSON.stringify(distribution))
  //write config to chain
  // distributionAndConfigRemarks.push('PROOFOFCHAOS2::' + referendumIndex.toString() + '::CONFIG::' + JSON.stringify(config))
  // if (!settings.isTest) {
  //     logger.info("distributionAndConfigRemarks: ", JSON.stringify(distributionAndConfigRemarks))
  // }
};
