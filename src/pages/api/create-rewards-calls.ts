import { BN } from "@polkadot/util";
import { logger } from "./nft_sendout_script/tools/logger";
import { CallResult, RewardConfiguration } from "./nft_sendout_script/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import seedrandom from "seedrandom";
import {
  getApiKusama,
  getApiStatemine,
  getChainDecimals,
} from "./nft_sendout_script/tools/substrateUtils";
import {
  getBlockNumber,
  setupPinata,
} from "./nft_sendout_script/src/_helpersApi";
import { getConvictionVoting } from "./nft_sendout_script/src/voteData";
import {
  getDecoratedVotesWithInfo,
  retrieveAccountLocks,
} from "./nft_sendout_script/src/_helpersVote";
import { getTxsReferendumRewards } from "./nft_sendout_script/src/generateTxs";

export default async function handler(req, res) {
  const config = JSON.parse(req.body);
  try {
    const { call, distribution, fees } = await generateCalls(config);
    console.log(distribution);
    res.status(200).json({
      config: config,
      preimage: call,
      distribution,
      fees,
    });
  } catch (error) {
    // Sends error to the client side
    console.trace(error);
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
  }
}

const generateCalls = async (
  config: RewardConfiguration,
  seed: number = 0
): Promise<CallResult> => {
  const { refIndex, sender } = config;

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

  const nftCalls = apiStatemine.tx.utility
    .batchAll(txsStatemine)
    .method.toHex();
  const xcmCall = apiKusama.tx.utility.batchAll(txsKusama).method.toHex();

  console.log("calculating fees for sender", config.sender);
  const infoXcmCall = await apiKusama.tx.utility
    .batchAll(txsKusama)
    .paymentInfo(config.sender);

  const infoNftCall = await apiStatemine.tx.utility
    .batchAll(txsStatemine)
    .paymentInfo(config.sender);

  return {
    call: JSON.stringify(xcmCall),
    distribution: rarityDistribution,
    fees: {
      xcm: infoXcmCall.partialFee.toHuman(),
      nfts: infoNftCall.partialFee.toHuman(),
    },
  };

  //write distribution to chain
  // distributionAndConfigRemarks.push('PROOFOFCHAOS2::' + referendumIndex.toString() + '::DISTRIBUTION::' + JSON.stringify(distribution))
  //write config to chain
  // distributionAndConfigRemarks.push('PROOFOFCHAOS2::' + referendumIndex.toString() + '::CONFIG::' + JSON.stringify(config))
  // if (!settings.isTest) {
  //     logger.info("distributionAndConfigRemarks: ", JSON.stringify(distributionAndConfigRemarks))
  // }
};
