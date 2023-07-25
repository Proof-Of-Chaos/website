import { BN, formatBalance } from "@polkadot/util";
import { logger } from "./nft_sendout_script/tools/logger";
import {
  GenerateRewardsResult,
  RewardConfiguration,
} from "./nft_sendout_script/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import seedrandom from "seedrandom";

import fs from "fs";

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
import {
  getApiKusama,
  getApiKusamaAssetHub,
  getChainDecimals,
} from "../../data/chain";
import { getNewCollectionId } from "./nft_sendout_script/src/createCollection";

/**
 * Handler for the /api/create-rewards-calls endpoint
 * @param req The request object encoded as URLSearchParams
 * @param res
 */
export default async function handler(req, res) {
  let config;

  // Parse the form data: files and fields
  const form = formidable({});
  let fields;
  let files;
  try {
    [fields, files] = await form.parse(req);

    config = JSON.parse(fields.data);

    config.options.forEach(async (option) => {
      const file = files[`${option.rarity}File`][0];
      const readableFileStream = fs.createReadStream(file.filepath);
      option.file = readableFileStream;
    });
  } catch (err) {
    console.log("error parsing form", err);
  }

  console.log("api endpoint received", config);

  try {
    const callResult: GenerateRewardsResult = await generateCalls(config);
    res.status(200).json(callResult);
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
): Promise<GenerateRewardsResult> => {
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

  //get Kusama Asset Hub API
  const apiKusamaAssetHub = await getApiKusamaAssetHub();
  getNewCollectionId(apiKusamaAssetHub, "D3iNikJw3cPq6SasyQCy3k4Y77ZeecgdweTWoSegomHznG3");
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

  // get the list of all wallets that have voted along with their calculated NFT rarity and other info @see getDecoratedVotes
  const { decoratedVotes, distribution: rarityDistribution } =
    await getDecoratedVotesWithInfo(config, kusamaChainDecimals, logger);

  logger.info(
    `⚙️  Processing ${decoratedVotes.length} votes for referendum ${refIndex}`
  );

  //computing the actual calls is still WIP and likely to change

  // get all transactions that are needed for the distribution
  // TODO --- warning we slice by 10 here
  let { txsKusamaAssetHub, txsKusama } = await getTxsReferendumRewards(
    apiKusamaAssetHub,
    apiKusama,
    apiPinata,
    config,
    decoratedVotes,
    rarityDistribution,
    rng,
    logger
  );

  const nftCalls = apiKusamaAssetHub.tx.utility
    .batchAll(txsKusamaAssetHub)
    .method.toHex();
  const kusamaCalls = apiKusama.tx.utility.batchAll(txsKusama).method.toHex();

  logger.info(
    `📊 Generated ${txsKusamaAssetHub.length} txs for minting NFTs on Asset Hub (Kusama) and ${txsKusama.length} txs for Kusama XCM calls`
  );

  logger.info("💵 Calculating fees for sender", config.sender);

  const infoKusamaCalls = await apiKusama.tx.utility
    .batchAll(txsKusama)
    .paymentInfo(config.sender);

  const infoNftCalls = await apiKusamaAssetHub.tx.utility
    .batchAll(txsKusamaAssetHub)
    .paymentInfo(config.sender);

  logger.info("🎉 All Done");

  logger.info(
    "📄 Writing transactions to",
    `./log/tmp_transactions_${config.refIndex}_xcm.json`
  );
  fs.writeFileSync(
    `./log/tmp_transactions_${config.refIndex}_xcm.json`,
    JSON.stringify(
      {
        nfts: txsKusamaAssetHub.map((tx) => tx.toHuman()),
        xcm: txsKusama.map((tx) => tx.toHuman()),
      },
      null,
      2
    )
  );

  logger.info(
    "returning",
    JSON.stringify(
      {
        call: "omitted",
        distribution: rarityDistribution,
        fees: {
          kusama: formatBalance(infoKusamaCalls.partialFee, {
            withSi: false,
            forceUnit: "KSM",
            decimals: kusamaChainDecimals.toNumber(),
          }),
          nfts: formatBalance(infoNftCalls.partialFee, {
            withSi: false,
            forceUnit: "KSM",
            decimals: kusamaChainDecimals.toNumber(),
          }),
        },
        txsCount: {
          kusama: txsKusama.length,
          nfts: txsKusamaAssetHub.length,
        },
      },
      null,
      2
    )
  );

  return {
    call: "omitted",
    kusamaCall: JSON.stringify(kusamaCalls),
    kusamaAssetHubCall: JSON.stringify(nftCalls),
    kusamaAssetHubTxs: txsKusamaAssetHub,
    distribution: rarityDistribution,
    fees: {
      kusama: formatBalance(infoKusamaCalls.partialFee, {
        withSi: false,
        forceUnit: "KSM",
        decimals: kusamaChainDecimals.toNumber(),
      }),
      nfts: formatBalance(infoNftCalls.partialFee, {
        withSi: false,
        forceUnit: "KSM",
        //TODO this could be wrong on other chains
        decimals: kusamaChainDecimals.toNumber(),
      }),
    },
    txsCount: {
      kusama: txsKusama.length,
      nfts: txsKusamaAssetHub.length,
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
