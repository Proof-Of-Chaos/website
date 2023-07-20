import { BN } from "@polkadot/util";
import { logger } from "./nft_sendout_script/tools/logger";
import { CallResult, RewardConfiguration } from "./nft_sendout_script/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import seedrandom from "seedrandom";

import fs from "fs";

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
import { Readable } from "stream";
import formidable, { errors as formidableErrors } from "formidable";

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Handler for the /api/create-rewards-calls endpoint
 * @param req The request object encoded as URLSearchParams
 * @param res
 */
export default async function handler(req, res) {
  let config;

  const form = formidable({});
  let fields;
  let files;
  try {
    [fields, files] = await form.parse(req);

    config = JSON.parse(fields.data);

    config.options.forEach(async (option) => {
      // console.log("option", option.rarity, files[`${option.rarity}File`][0]);
      const file = files[`${option.rarity}File`][0];
      const readableFileStream = fs.createReadStream(file.filepath);
      // console.log("file for option", option.rarity, data);
      option.file = readableFileStream;
    });
  } catch (err) {
    console.log("error parsing form", err);
  }

  // const buf = await buffer(req);
  // config = buf.toString("utf8");

  // try {
  //   console.log("received config", req);
  // } catch (error) {
  //   console.log("error parsing config", error);
  //   res.status(400).json({
  //     name: "error parsing config",
  //     message: error.message,
  //   });
  // }

  // const config = req.body;
  console.log("api endpoint received", config);

  try {
    const { call, distribution, fees } = await generateCalls(config);
    console.log(distribution);
    res.status(200).json({
      // config: config,
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
    `🚀 Generating calls for reward distribution of referendum ${refIndex}`
  );
  // logger.info("with config", config);

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
  logger.info(
    `⚙️  Processing ${votes.length} votes for referendum ${refIndex}`
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

  const nftCalls = apiStatemine.tx.utility
    .batchAll(txsStatemine)
    .method.toHex();
  const xcmCall = apiKusama.tx.utility.batchAll(txsKusama).method.toHex();

  logger.info(
    `📊 Generated ${txsStatemine.length} txs for minting NFTs on Statemine and ${txsKusama.length} txs for Kusama XCM calls`
  );

  logger.info("💵 Calculating fees for sender", config.sender);

  const infoXcmCall = await apiKusama.tx.utility
    .batchAll(txsKusama)
    .paymentInfo(config.sender);

  const infoNftCall = await apiStatemine.tx.utility
    .batchAll(txsStatemine)
    .paymentInfo(config.sender);

  logger.info("🎉 All Done");

  logger.info("transactions", {
    xcm: txsKusama.length,
    nfts: txsStatemine.length,
  });

  logger.info(
    "📄 Writing transactions to",
    `./log/tmp_transactions_${config.refIndex}_xcm.json`
  );
  fs.writeFileSync(
    `./log/tmp_transactions_${config.refIndex}_xcm.json`,
    JSON.stringify(
      {
        nfts: txsStatemine.map((tx) => tx.toHuman()),
        xcm: txsKusama.map((tx) => tx.toHuman()),
      },
      null,
      2
    )
  );

  return {
    call: JSON.stringify(xcmCall),
    distribution: rarityDistribution,
    fees: {
      xcm: infoXcmCall.partialFee.toHuman(),
      nfts: infoNftCall.partialFee.toHuman(),
    },
    txsCount: {
      xcm: txsKusama.length,
      nfts: txsStatemine.length,
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

export const config = {
  api: {
    bodyParser: false,
  },
};
