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
  rarityDistribution: RarityDistribution
): Promise<ProcessMetadataResult> => {
  let metadataCids = {};
  let attributes = {};

  for (const option of config.options) {
    const attributesDirect = generateAttributes(
      option,
      "direct",
      rarityDistribution[option.rarity]
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
      rarityDistribution[option.rarity]
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

    metadataCids[option.rarity] = {
      direct: metadataCidDirect,
      delegated: metadataCidDelegated,
    };
    attributes[option.rarity] = {
      direct: attributesDirect,
      delegated: attributesDelegated,
    };
  }
  return { metadataCids, attributes };
};

// Function to create transactions for each mapped vote
const createTransactionsForVotes = async (
  apiStatemine: ApiPromise,
  config: RewardConfiguration,
  metadataCids,
  attributes,
  decoratedVotes: VoteConviction[],
  rng: RNG,
  referendumIndex: string,
  proxyWallet: string
): Promise<any> => {
  const txs = [];
  for (let i = 0; i < decoratedVotes.length; i++) {
    const vote = decoratedVotes[i];

    // the rarity option that was chosen for the voter
    const { chosenOption } = vote;

    const selectedMetadata = metadataCids[chosenOption.rarity];

    let metadataCid =
      vote.voteType == "Delegating"
        ? selectedMetadata.delegated
        : selectedMetadata.direct;

    // console.info(
    //   "checking vote by address: ",
    //   vote.address.toString(),
    //   vote.voteType
    // );
    // console.info("chosenOption", chosenOption.rarity);
    // console.info("selectedMetadata", selectedMetadata);
    // console.info("metadataCid", metadataCid);

    const randRoyaltyInRange = Math.floor(
      rng() * (chosenOption.maxRoyalty - chosenOption.minRoyalty + 1) +
        chosenOption.minRoyalty
    );

    if (!metadataCid) {
      logger.error(`metadataCid is null. exiting.`);
      return;
    }
    if (
      vote.address.toString() ==
      "Hgcdd6sjp37KD1cKrAbwMZ6sBZTAVwb6v2GTssv9L2w1oN3"
    ) {
      txs.push(
        apiStatemine.tx.nfts.mint(
          config.newCollectionSymbol,
          i,
          vote.address.toString(),
          null
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "royaltyPercentFloat",
          vote.meetsRequirements ? randRoyaltyInRange : config.defaultRoyalty
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "royaltyReceiver",
          "DhvRNnnsyykGpmaa9GMjK9H4DeeQojd5V5qCTWd1GoYwnTc"
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "amountLockedInGovernance",
          vote.lockedWithConvictionDecimal
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "voteDirection",
          vote.voteDirection
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "aye",
          vote.balance.aye.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "nay",
          vote.balance.nay.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "abstain",
          vote.balance.abstain.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "delegatedConvictionBalance",
          vote.delegatedConvictionBalance.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "chanceAtEpic",
          vote.chances.epic.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "chanceAtRare",
          vote.chances.rare.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "chanceAtCommon",
          vote.chances.common.toString()
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "voter",
          vote.address.toString()
        )
      );
      // txs.push(
      //   apiStatemine.tx.nfts.setAttribute(
      //     config.newCollectionSymbol,
      //     i,
      //     "CollectionOwner",
      //     "dragonEquipped",
      //     vote.dragonEquipped
      //   )
      // );
      // txs.push(
      //   apiStatemine.tx.nfts.setAttribute(
      //     config.newCollectionSymbol,
      //     i,
      //     "CollectionOwner",
      //     "quizCorrect",
      //     vote.quizCorrect.toString()
      //   )
      // );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "encointerScore",
          vote.encointerScore
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "referendumIndex",
          referendumIndex
        )
      );
      txs.push(
        apiStatemine.tx.nfts.setAttribute(
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          "meetsRequirements",
          vote.meetsRequirements
        )
      );
      for (const attribute of vote.voteType == "Delegating"
        ? attributes[chosenOption.rarity].delegated
        : attributes[chosenOption.rarity].direct) {
        txs.push(
          apiStatemine.tx.nfts.setAttribute(
            config.newCollectionSymbol,
            i,
            "CollectionOwner",
            attribute.name,
            attribute.value
          )
        );
      }
      txs.push(
        apiStatemine.tx.nfts.setMetadata(
          config.newCollectionSymbol,
          i,
          metadataCid
        )
      );
      // txs.push(
      //   apiStatemine.tx.nfts.transfer(
      //     config.newCollectionSymbol,
      //     i,
      //     vote.address.toString()
      //   )
      // );
    }
  }

  return txs;
};

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
  const pinata = await setupPinata();

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
      apiStatemine.tx.nfts.create(config.newCollectionSymbol, proxyWallet)
    );
    config.newCollectionMetadataCid = await createNewCollection(pinata, config);
    txs.push(
      apiStatemine.tx.uniques.setCollectionMetadata(
        config.newCollectionSymbol,
        config.newCollectionMetadataCid
      )
    );
    // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.create(config.newCollectionSymbol, proxyWallet)))
    // config.newCollectionMetadataCid = await createNewCollection(pinata, account.address, config);
    // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.setCollectionMetadata(config.newCollectionSymbol, config.newCollectionMetadataCid, false)))
  } else {
    // TODO use a default collection
  }
  logger.info("collectionID Item: ", itemCollectionId);

  const { metadataCids, attributes } = await processMetadataForOptions(
    config,
    pinata,
    referendumIndex,
    rarityDistribution
  );

  // Create transactions for each mapped vote
  txs.push(
    ...(await createTransactionsForVotes(
      apiStatemine,
      config,
      metadataCids,
      attributes,
      decoratedVotes,
      rng,
      referendumIndex.toString(),
      proxyWallet
    ))
  );

  // // check if settings collection exists already
  // const collectionExists = await checkCollectionExists(apiStatemine, new BN(collectionId));

  // // create settings collection if necessary
  // if (!collectionExists) {

  // }

  // // pin config nft data
  // const metadataCidSettings = await pinSingleMetadataFromDir(
  //   pinata,
  //   "/public/config",
  //   "nftImage.png",
  //   `Referendum ${referendumIndex}`,
  //   { description: `This is the config NFT for Referendum ${referendumIndex}. It includes all the relevant configs used to create the sendout.` }
  // );
  // // create an NFT with the sendout config
  // createConfigNFT(apiStatemine,
  //   config,
  //   metadataCidSettings,
  //   referendumIndex.toString(),
  //   proxyWallet)

  const batchMethodtx = apiStatemine.tx.utility.batchAll(txs).method.toHex();
  const batchtx = apiStatemine.tx.utility.batchAll(txs).toHex();
  fs.writeFile(`public/output/${referendumIndex}.json`, batchtx, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });

  // console.log(apiStatemine.tx.utility.batch(txs).toHex())

  //determine refTime + proofSize
  const requiredWeight = (
    await apiStatemine.call.transactionPaymentCallApi.queryCallInfo(
      batchMethodtx,
      0
    )
  ).toJSON();
  const refTime = requiredWeight["weight"]["refTime"];
  const proofSize = requiredWeight["weight"]["proofSize"];

  //design xcmv3 call
  const dest = {
    V3: {
      interior: {
        X1: {
          Parachain: 1000,
        },
      },
      parents: 0,
    },
  };
  const message = {
    V3: [
      {
        Transact: {
          call: batchtx,
          origin_kind: "Superuser",
          require_weight_at_most: {
            proof_size: proofSize,
            ref_time: refTime,
          },
        },
      },
    ],
  };
  const xcmCall = apiKusama.tx.xcmPallet.send(dest, message);

  let distributionAndConfigRemarks = [];
  let txsKusama = [];
  txsKusama.push(
    apiKusama.tx.system.remark(
      "Created with https://www.proofofchaos.app/referendum-rewards/"
    )
  );
  txsKusama.push(xcmCall);

  const finalCall = apiKusama.tx.utility.batchAll(txsKusama).method.toHex();
  // fs.writeFile(`public/output/1.json`, finalCall, (err) => {
  //   // In case of a error throw err.
  //   if (err) throw err;
  // })
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
