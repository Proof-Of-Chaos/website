import seedrandom from "seedrandom";
import { BN } from "@polkadot/util";
import { logger } from "../tools/logger";
import { RewardConfiguration, CallResult } from "../types.js";
import {
  getApiKusama,
  getApiStatemine,
  getChainDecimals,
} from "../tools/substrateUtils";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import {
  getDecoratedVotesWithInfo,
  retrieveAccountLocks,
} from "./_helpersVote";
import { getConvictionVoting } from "./voteData";
import { getBlockNumber, setupPinata } from "./_helpersApi";
import { getTxsReferendumRewards } from "./generateTxs";

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
    rng,
    logger
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
