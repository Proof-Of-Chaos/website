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
  ProcessMetadataResult,
  FetchReputableVotersParams,
  Bonuses,
  RewardConfiguration,
  RewardOption,
  VoteConvictionEncointer,
  CallResult,
  RarityDistribution,
  Chances,
} from "../types.js";
import {
  getApiKusama,
  getApiStatemine,
  getChainDecimals,
  getDecimal,
} from "../tools/substrateUtils";
import { getDragonBonusFile } from "../tools/utils";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { createNewCollection } from "./createNewCollection";
import {
  checkVotesMeetingRequirements,
  getDecoratedVotesWithInfo,
  getMinMaxMedian,
  retrieveAccountLocks,
} from "./_helpersVote";
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
import { getBlockNumber, setupPinata } from "./_helpersApi";
import {
  getTransactionsForVotes,
  getTxsReferendumRewards,
} from "./generateTxs";

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
const calculateLuck = (
  voteAmountWithConviction: number,
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
): string => {
  // console.log(
  //   "calculate luck",
  //   voteAmountWithConviction,
  //   minIn,
  //   maxIn,
  //   minOut,
  //   maxOut,
  //   exponent,
  //   babyBonus,
  //   toddlerBonus,
  //   adolescentBonus,
  //   adultBonus,
  //   quizBonus,
  //   encointerBonus,
  //   dragonEquipped,
  //   quizCorrect,
  //   encointerScore,
  //   reputationLifetime
  // );
  let n = voteAmountWithConviction;
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

// Function to create transactions for each mapped vote

// Function to create a config NFT
const createConfigNFT = async (
  apiStatemine,
  config,
  metadataCidSettings,
  referendumIndex,
  proxyWallet
) => {
  const txs = [];

  txs.push(
    apiStatemine.tx.uniques.mint(
      config.settingsCollectionSymbol,
      referendumIndex,
      proxyWallet
    )
  );
  txs.push(
    apiStatemine.tx.uniques.setAttribute(
      config.settingsCollectionSymbol,
      referendumIndex,
      "seed",
      config.seed
    )
  );
  txs.push(
    apiStatemine.tx.uniques.setMetadata(
      config.settingsCollectionSymbol,
      referendumIndex,
      metadataCidSettings,
      true
    )
  );

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

export const generateCalls = async (
  config: RewardConfiguration,
  seed: number = 0
): Promise<CallResult> => {
  const { refIndex } = config;

  logger.info(
    `Generating calls for reward distribution of referendum ${refIndex}`
  );
  logger.info("with config", config);

  await cryptoWaitReady();
  const referendumIndex = new BN(config.refIndex);

  //get Kusama API
  const apiKusama = await getApiKusama();
  const kusamaChainDecimals = await getChainDecimals("kusama");

  //get Statemine API
  const apiStatemine = await getApiStatemine();

  //seed the randomizer
  const rng = seedrandom(seed.toString());

  //get ref ended block number
  let blockNumber;
  try {
    blockNumber = await getBlockNumber(apiKusama, referendumIndex);
    if (!blockNumber) throw new Error("Referendum is still ongoing");
  } catch (e) {
    logger.error(`Referendum is still ongoing: ${e}`);
    throw new Error(`Referendum is still ongoing: ${e}`);
  }

  //initialize Pinata
  const apiPinata = await setupPinata();

  //retrieve all votes for a given ref
  const { referendum, totalIssuance, votes } = await getConvictionVoting(
    parseInt(refIndex)
  );
  logger.info(`Processing ${votes.length} votes for referendum ${refIndex}`);

  //depending on outcome of the ref, voted amounts may or may not be locked up.
  //we consider locked amounts as opposed to merely voting amounts.
  //funds are not locked up when the outcome of a ref goes against a vote.
  //we retrieve account locks for each voting wallet at ref end to come up with a "voted amount".
  const voteLocks = await retrieveAccountLocks(
    votes,
    referendum.confirmationBlockNumber
  );

  // get the list of all wallets that have voted along with their calculated NFT rarity and other info @see getDecoratedVotes
  const { decoratedVotes, distribution: rarityDistribution } =
    await getDecoratedVotesWithInfo(config, kusamaChainDecimals, logger);

  //computing the actual calls is still WIP and likely to change

  // get all transactions that are needed for the distribution
  let { txsStatemine, txsKusama } = await getTxsReferendumRewards(
    apiStatemine,
    apiKusama,
    apiPinata,
    config,
    decoratedVotes,
    rarityDistribution,
    rng
  );

  const finalCall = apiKusama.tx.utility.batchAll(txsKusama).method.toHex();

  return {
    call: JSON.stringify(finalCall),
    distribution: rarityDistribution,
  };

  //write distribution to chain
  // distributionAndConfigRemarks.push('PROOFOFCHAOS2::' + referendumIndex.toString() + '::DISTRIBUTION::' + JSON.stringify(distribution))
  //write config to chain
  // distributionAndConfigRemarks.push('PROOFOFCHAOS2::' + referendumIndex.toString() + '::CONFIG::' + JSON.stringify(config))
  // if (!settings.isTest) {
  //     logger.info("distributionAndConfigRemarks: ", JSON.stringify(distributionAndConfigRemarks))
  // }
};
