import { logger } from "./nft_sendout_script/tools/logger";
import formidable, { errors as formidableErrors } from "formidable";
import fs from "fs";
import {
  getTxsCollectionCreate,
} from "./nft_sendout_script/src/createCollection";
import { getApiKusamaAssetHub, getChainDecimals, sendAndFinalize } from "../../data/chain";
import { CreateCollectionResult, RewardConfiguration } from "./nft_sendout_script/types";
import { formatBalance } from "@polkadot/util";
import { cryptoWaitReady } from "@polkadot/util-crypto";

/**
 * Handler for the /api/create-new-collection endpoint
 * @param req The request object encoded as URLSearchParams
 * @param res
 */
export default async function handler(req, res) {
  let config;

  const form = formidable({});
  let fields;
  let files;
  let imageFile;
  try {
    [fields, files] = await form.parse(req);

    config = JSON.parse(fields.data);

    const file = files["imageFile"][0];

    console.log("aaaaa api endpoint received", config, "files", files);

    const readableFileStream = fs.createReadStream(file.filepath);
    imageFile = readableFileStream;

  } catch (err) {
    console.log("error parsing form", err);
    res.status(400).json({
      name: err.name,
      message: err.message,
    });
  }

  try {
    const callResult: CreateCollectionResult = await generateCalls(config);
    res.status(200).json(callResult);
  } catch (error) {
    // Sends error to the client side
    console.trace(error);
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
  }

  res.status(200).json({
    newCollectionId: 3,
  });
}

const generateCalls = async (
  config: RewardConfiguration
): Promise<CreateCollectionResult> => {
  const { refIndex, sender } = config;

  logger.info(
    `🚀 Generating calls for reward distribution of referendum ${refIndex}`
  );
  // logger.info("with config", config);

  await cryptoWaitReady();

  const kusamaChainDecimals = await getChainDecimals("kusama");

  //get Kusama Asset Hub API
  const apiKusamaAssetHub = await getApiKusamaAssetHub();
  let { txsKusamaAssetHub } = await getTxsCollectionCreate(apiKusamaAssetHub, config);
  const assetHubCalls = apiKusamaAssetHub.tx.utility
    .batchAll(txsKusamaAssetHub)
    .method.toHex();

  logger.info(
    `📊 Generated ${txsKusamaAssetHub.length} txs for minting NFTs on Asset Hub (Kusama)`
  );

  logger.info("💵 Calculating fees for sender", config.sender);

  const infoAssetHubCalls = await apiKusamaAssetHub.tx.utility
    .batchAll(txsKusamaAssetHub)
    .paymentInfo(config.sender);

  logger.info("🎉 All Done");

  logger.info(
    "📄 Writing transactions to",
    `./log/tmp_transactions_${config.refIndex}_collection.json`
  );
  fs.writeFileSync(
    `./log/tmp_transactions_${config.refIndex}_collection.json`,
    JSON.stringify(
      txsKusamaAssetHub.map((tx) => tx.toHuman()),
      null,
      2
    )
  );

  logger.info(
    "returning",
    JSON.stringify(
      {
        call: "omitted",
        fees: formatBalance(infoAssetHubCalls.partialFee, {
          withSi: false,
          forceUnit: "KSM",
          //TODO this could be wrong on other chains
          decimals: kusamaChainDecimals.toNumber(),
        }),
      },
      null,
      2
    )
  );

  return {
    call: "omitted",
    kusamaAssetHubCall: JSON.stringify(assetHubCalls),
    kusamaAssetHubTxs: txsKusamaAssetHub,
    fees: formatBalance(infoAssetHubCalls.partialFee, {
      withSi: false,
      forceUnit: "KSM",
      //TODO this could be wrong on other chains
      decimals: kusamaChainDecimals.toNumber(),
    }),
    txsCount: txsKusamaAssetHub.length,
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};


