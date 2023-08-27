import "@polkadot/rpc-augment";
import "@polkadot/api-augment/kusama";
import { BN, bnToBn, formatBalance } from "@polkadot/util";
import {
  CollectionConfiguration,
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
  createConfigNFT,
  getDecoratedVotesWithInfo,
  retrieveAccountLocks,
} from "./nft_sendout_script/src/_helpersVote";
import { getTxsReferendumRewards } from "./nft_sendout_script/src/generateTxs";
import { Readable } from "stream";
import formidable, { errors as formidableErrors } from "formidable";
import {
  CHAIN,
  getChainDecimals,
  getNFTCollectionDeposit,
  getNFTItemDeposit,
} from "../../data/chain";
import { getApiKusama, getApiKusamaAssetHub } from "../../data/getApi";
import PinataClient from "@pinata/sdk";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

/**
 * Handler for the /api/create-rewards-calls endpoint
 * @param req The request object encoded as URLSearchParams
 * @param res
 */
export default async function handler(req, res) {
  let config: RewardConfiguration;

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

    if (config.collectionConfig.isNew) {
      const file = files["collectionImage"][0];
      const readableFileStream = fs.createReadStream(file.filepath);
      config.collectionConfig.file = readableFileStream;
    }
  } catch (err) {
    // console.log("error parsing form", err)
  }

  // console.log("api endpoint received", config, files)

  //initialize Pinata
  const apiPinata = await setupPinata();

  try {
    const callResult: GenerateRewardsResult = await generateCalls(
      apiPinata,
      config
    );

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
  apiPinata: PinataClient,
  config: RewardConfiguration,
  seed: number = 0
): Promise<GenerateRewardsResult> => {
  const { refIndex, sender } = config;

  console.info(
    `🚀 Generating calls for reward distribution of referendum ${refIndex}`
  );
  console.info("with config", config);

  await cryptoWaitReady();

  const referendumIndex = new BN(config.refIndex);

  //get Kusama API
  const apiKusama = await getApiKusama();
  const kusamaChainDecimals = await getChainDecimals(CHAIN.KUSAMA);

  //get Kusama Asset Hub API
  const apiKusamaAssetHub = await getApiKusamaAssetHub();
  //seed the randomizer
  const rng = seedrandom(seed.toString());

  //get ref ended block number
  let blockNumber;
  console.info(`ℹ️  Getting block number for referendum ${refIndex}`);
  try {
    blockNumber = await getBlockNumber(apiKusama, referendumIndex);
    if (!blockNumber) throw new Error("Referendum is still ongoing");
  } catch (e) {
    // logger.error(`Referendum is still ongoing: ${e}`)
    throw new Error(`Referendum is still ongoing: ${e}`);
  }

  console.info(`ℹ️  Getting all voting wallets for ${refIndex}`);
  // get the list of all wallets that have voted along with their calculated NFT rarity and other info @see getDecoratedVotes
  const { decoratedVotes, distribution: rarityDistribution } =
    await getDecoratedVotesWithInfo(config, kusamaChainDecimals);

  console.info(
    `⚙️  Processing ${decoratedVotes.length} votes for referendum ${refIndex}`
  );

  //computing the actual calls is still WIP and likely to change

  // get all transactions that are needed for the distribution
  // TODO --- warning we slice by 10 here
  let { txsKusamaAssetHub } = await getTxsReferendumRewards(
    apiKusamaAssetHub,
    apiKusama,
    apiPinata,
    config,
    decoratedVotes,
    rarityDistribution,
    rng
    // logger
  );

  const nftCalls = apiKusamaAssetHub.tx.utility
    .batchAll(txsKusamaAssetHub)
    .method.toHex();

  // const kusamaCalls = apiKusama.tx.utility.batchAll(txsKusama).method.toHex();

  console.info(
    `📊 Generated ${txsKusamaAssetHub.length} txs for minting NFTs on Asset Hub (Kusama)`
    // ,` and ${txsKusama.length} txs for Kusama XCM calls`
  );

  console.info(`💵 Calculating fees for sender ${config.sender}`);

  // const infoKusamaCalls = await apiKusama.tx.utility
  //   .batchAll(txsKusama)
  //   .paymentInfo(config.sender);

  const infoNftCalls = await apiKusamaAssetHub.tx.utility
    .batchAll(txsKusamaAssetHub)
    .paymentInfo(config.sender);

  const collectionDeposit = await getNFTCollectionDeposit(apiKusamaAssetHub);
  const itemDeposit = await getNFTItemDeposit(apiKusamaAssetHub);

  const voters = decoratedVotes.map((vote) => vote.address);
  const totalNFTs = voters.length;

  console.log(
    "calculating fees with ",
    config,
    totalNFTs,
    itemDeposit,
    collectionDeposit
  );

  const totalDeposit = config.collectionConfig.isNew
    ? new BN(collectionDeposit)
        .add(new BN(itemDeposit).muln(totalNFTs))
        .toString()
    : new BN(itemDeposit).muln(totalNFTs).toString();

  console.info(
    `📊 Total fees for sender ${config.sender} are ${totalDeposit} KSM`
  );

  console.info("🎉 All Done");

  // console.info(
  //   `📄 Writing transactions to
  //   ./log/tmp_transactions_${config.refIndex}_xcm.json`
  // );

  // fs.writeFileSync(
  //   `./log/tmp_transactions_${config.refIndex}_xcm.json`,
  //   JSON.stringify(
  //     {
  //       nfts: txsKusamaAssetHub.map((tx) => tx.toHuman()),
  //       xcm: txsKusama.map((tx) => tx.toHuman()),
  //       deposits: {
  //         collectionDeposit,
  //         itemDeposit,
  //       },
  //     },
  //     null,
  //     2
  //   )
  // );

  console.info(
    `returning
    ${JSON.stringify(
      {
        call: "omitted",
        distribution: rarityDistribution,
        voters,
        fees: {
          // kusama: formatBalance(infoKusamaCalls.partialFee, {
          //   withSi: false,
          //   forceUnit: "KSM",
          //   decimals: kusamaChainDecimals.toNumber(),
          // }),
          nfts: formatBalance(infoNftCalls.partialFee, {
            withSi: false,
            forceUnit: "KSM",
            decimals: kusamaChainDecimals.toNumber(),
          }),
          deposits: {
            collectionDeposit,
            itemDeposit,
          },
        },
        txsCount: {
          // kusama: txsKusama.length,
          nfts: txsKusamaAssetHub.length,
        },
      },
      null,
      2
    )}`
  );

  return {
    call: "omitted",
    config,
    // kusamaCall: JSON.stringify(kusamaCalls),
    kusamaCall: "",
    kusamaAssetHubCall: JSON.stringify(nftCalls),
    kusamaAssetHubTxs: txsKusamaAssetHub,
    voters,
    distribution: rarityDistribution,
    fees: {
      // kusama: formatBalance(infoKusamaCalls.partialFee, {
      //   withSi: false,
      //   forceUnit: "KSM",
      //   decimals: kusamaChainDecimals.toNumber(),
      // }),
      nfts: formatBalance(infoNftCalls.partialFee, {
        withSi: false,
        forceUnit: "KSM",
        //TODO this could be wrong on other chains
        decimals: kusamaChainDecimals.toNumber(),
      }),
      deposit: formatBalance(totalDeposit, {
        withSi: false,
        forceUnit: "KSM",
        decimals: kusamaChainDecimals.toNumber(),
      }),
    },
    txsCount: {
      // kusama: txsKusama.length,
      nfts: txsKusamaAssetHub.length,
    },
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};
