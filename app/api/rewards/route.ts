import { DEFAULT_CHAIN, getChainByName, getChainInfo } from "@/config/chains";
import { SubstrateChain } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { zfd } from "zod-form-data";
import {
  RewardConfiguration,
  GenerateRewardsResult,
} from "../../[chain]/referendum-rewards/types";
import { BN, bnToBn } from "@polkadot/util";
import { getDecoratedVotesWithInfo, setupPinata } from "./util";
import PinataClient from "@pinata/sdk";
import seedrandom from "seedrandom";
import { getTxsReferendumRewards } from "./get-reward-txs";
import { Readable } from "stream";
import { encodeAddress } from "@polkadot/keyring";
import {
  getNFTCollectionDeposit,
  getNFTItemDeposit,
  getNFTMetadataDeposit,
} from "@/config/txs";
import { mergeWithDefaultConfig } from "@/components/util";
import { zodSchemaObject } from "@/app/[chain]/referendum-rewards/rewards-schema";

export async function POST(req: NextRequest) {
  let res = NextResponse<GenerateRewardsResult>;

  let zodErrors = {};
  let formData: FormData;
  let rewardConfig: RewardConfiguration;
  let selectedChain: SubstrateChain;
  let sender;

  // parse the form data that is coming from the client
  formData = await req.formData();
  // console.log("formData", formData);

  sender = formData?.get("sender")?.toString();
  if (!sender) {
    return res.json({
      status: "error",
      errors: { form: "No sender address" },
    });
  }

  // get the form data as json so we can work with it
  const rewardConfigData = formData?.get("rewardConfig");
  if (!rewardConfigData) {
    return res.json({
      status: "error",
      errors: { form: "No reward config data" },
    });
  }

  try {
    rewardConfig = JSON.parse(rewardConfigData?.toString());
    console.log("rewardConfig json", rewardConfig);
  } catch (error) {
    console.log("Error parsing form data", error);
    return res.json({
      errors: { form: "Error parsing form data" },
      success: false,
    });
  }

  try {
    // validate the incoming form data (without the files that were sent)
    selectedChain = (rewardConfig.chain as SubstrateChain) || DEFAULT_CHAIN;
    const { ss58Format } = getChainInfo(selectedChain);

    // override the file of each option with a file from the parsed form data
    // this is needed because the file is not serializable
    rewardConfig.options.forEach((option) => {
      option.file = formData?.get(`${option.rarity}File`);
      option.fileCover = formData?.get(`${option.rarity}FileCover`);
    });

    // override the file of the collection config with a file from the parsed form data
    rewardConfig.collectionConfig.file = formData?.get("collectionImage");

    console.log("rewardConfig after file transform", rewardConfig);

    const schemaObject = zodSchemaObject(selectedChain, sender, ss58Format);
    const schema = zfd.formData(schemaObject);

    // console.info("validating form data", rewardConfig);
    const result = await schema.safeParseAsync(rewardConfig);
    // console.log("result", result);

    if (!result.success) {
      result.error.issues.map((issue) => {
        zodErrors = {
          ...zodErrors,
          [issue.path[0]]: issue.message,
        };
      });
    }
  } catch (error) {
    console.log("error validating form data", error);
    return res.json(
      Object.keys(zodErrors).length > 0
        ? { errors: zodErrors, success: false }
        : { success: true }
    );
  }

  try {
    // add the Buffers instead of the files so we can work with it
    rewardConfig?.options?.forEach(async (option) => {
      const file: File | null = formData?.get(`${option.rarity}File`) as File;
      const fileCover: File | null = formData?.get(
        `${option.rarity}FileCover`
      ) as File;

      console.log("filenames", option.rarity, file?.name, fileCover?.name);
      console.log("filetypes", file?.type, fileCover?.type);

      if (file) {
        option.fileType = file?.type;
        const bytes = await file?.arrayBuffer();
        option.file = Readable.from(Buffer.from(bytes));
      }

      if (fileCover) {
        option.coverFileType = fileCover?.type;
        const bytes = await fileCover?.arrayBuffer();
        option.fileCover = Readable.from(Buffer.from(bytes));
      }
    });

    if (rewardConfig.collectionConfig.isNew) {
      const file = formData?.get("collectionImage") as File | null;
      if (file) {
        const bytes = await file.arrayBuffer();
        rewardConfig.collectionConfig.file = Readable.from(Buffer.from(bytes));
      }
    }
  } catch (e) {
    throw "Error converting files to readable streams";
  }

  try {
    const apiPinata = await setupPinata();
    rewardConfig = mergeWithDefaultConfig(rewardConfig, selectedChain);

    const callResult: GenerateRewardsResult = await generateCalls(
      apiPinata,
      selectedChain,
      rewardConfig,
      sender as string
    );

    return res.json({ status: "success", ...callResult });
  } catch (error: any) {
    console.trace(error);
    // res.status(400).json({
    //   name: error.name,
    //   message: error.message,
    // });
    return res.json({
      status: "error",
      errors: { form: error.message },
    });
  }
}

const generateCalls = async (
  apiPinata: PinataClient | null,
  selectedChain: SubstrateChain,
  config: RewardConfiguration,
  sender: string | null,
  seed: number = 0
): Promise<GenerateRewardsResult> => {
  const { refIndex } = config;

  console.info(
    `🚀 Generating calls for reward distribution of referendum ${refIndex}`
  );

  console.info("🔧 with config", config);

  const chainConfig = await getChainByName(selectedChain);
  const { api: referendaPalletApi, assetHubApi: nftPalletApi } = chainConfig;
  const { decimals: relayChainDecimals, ss58Format } = chainConfig;
  const referendumIndex = new BN(config.refIndex);

  // seed the randomizer
  const rng = seedrandom(seed.toString());

  //get ref ended block number
  //TODO check the referendum is not ongoing
  //   let blockNumber;
  //   console.info(`ℹ️  Getting block number for referendum ${refIndex}`);
  //   try {
  //     blockNumber = await getBlockNumber(referendaPalletApi, referendumIndex);
  //     if (!blockNumber) throw new Error("Referendum is still ongoing");
  //   } catch (e) {
  //     // logger.error(`Referendum is still ongoing: ${e}`)
  //     throw new Error(`Referendum is still ongoing: ${e}`);
  //   }

  console.info(`ℹ️  Getting all voting wallets for referendum ${refIndex}`);
  // get the list of all wallets that have voted along with their calculated NFT rarity and other info @see getDecoratedVotes
  const { decoratedVotes, distribution: rarityDistribution } =
    await getDecoratedVotesWithInfo(
      referendaPalletApi,
      config,
      bnToBn(relayChainDecimals)
    );

  console.info(
    `⚙️  Processing ${decoratedVotes.length} votes for referendum ${refIndex}`
  );

  //computing the actual calls is still WIP and likely to change

  // get all transactions that are needed for the distribution of the rewards
  // ipfs pinning, metadata, also happens here
  let { txsAssetHub, txsPerVote } = await getTxsReferendumRewards(
    nftPalletApi,
    referendaPalletApi,
    apiPinata,
    config,
    decoratedVotes,
    rarityDistribution,
    rng
  );

  // const nftCalls = nftPalletApi?.tx.utility
  //   .batchAll(txsAssetHub)
  //   .method.toHex();

  // // const kusamaCalls = referendaPalletApi.tx.utility.batchAll(txsKusama).method.toHex();

  console.info(
    `📊 Generated ${txsAssetHub.length} txs for minting NFTs on Asset Hub (Kusama)`
    // ,` and ${txsKusama.length} txs for Kusama XCM calls`
  );

  let infoNftCalls = undefined;

  if (sender) {
    const encodedAddress = encodeAddress(sender, ss58Format);
    console.info(
      `💵 Calculating fees for sender ${sender} on chain address ${encodedAddress}`
    );

    const amountOfTxs = txsAssetHub.length;
    const amountOfNFTs = decoratedVotes.length;
    const txsPerNFT = amountOfTxs / amountOfNFTs;

    console.info(`📊 Generated ${amountOfTxs} txs for ${amountOfNFTs} NFTs`);
    console.info(`📊 Generated ${txsPerNFT} txs per NFT`);

    infoNftCalls = await nftPalletApi?.tx.utility
      .batchAll(txsAssetHub)
      .paymentInfo(encodedAddress);

    console.info("successfully calculated fees");
  }

  let totalDeposit = undefined;
  const collectionDeposit = await getNFTCollectionDeposit(nftPalletApi);
  const itemDeposit = await getNFTItemDeposit(nftPalletApi);
  const metadataDepositBase = await getNFTMetadataDeposit(nftPalletApi);
  // const attributeDepositBase = await getNFTAttributeDeposit(nftPalletApi);

  const voters = decoratedVotes.map((vote) => vote.address);
  const totalNFTs = voters.length;

  if (itemDeposit && metadataDepositBase) {
    totalDeposit = new BN(itemDeposit)
      .add(new BN(metadataDepositBase))
      .muln(totalNFTs);

    if (config.collectionConfig.isNew && totalDeposit && collectionDeposit) {
      totalDeposit.add(new BN(collectionDeposit));
    }
  }

  // console.info(
  //   `📊 Total fees for sender ${
  //     config.sender
  //   } are ${totalDeposit.toString()} KSM`
  // );

  console.info("🎉 All Done");

  return {
    status: "success",
    call: "omitted",
    config,
    // kusamaCall: JSON.stringify(kusamaCalls),
    // kusamaCall: "",
    assetHubCall: "", // JSON.stringify(nftCalls),
    assetHubTxs: txsAssetHub,
    assetHubTxsHuman: txsAssetHub.map((tx) => tx.method.toHuman()),
    voters,
    distribution: rarityDistribution,
    fees: {
      // kusama: formatBalance(infoKusamaCalls.partialFee, {
      //   withSi: false,
      //   forceUnit: "KSM",
      //   decimals: kusamaChainDecimals.toNumber(),
      // }),
      nfts: infoNftCalls?.partialFee?.toString(),
      deposit: totalDeposit?.toString(),
    },
    txsCount: {
      kusama: txsAssetHub.length,
      nfts: txsAssetHub.length,
      txsPerVote,
    },
  };
};
