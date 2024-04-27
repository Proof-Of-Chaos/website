import {
  RNG,
  RarityDistribution,
  RewardConfiguration,
} from "@/app/[chain]/referendum-rewards/types";
import { DecoratedConvictionVote } from "@/types";
import PinataClient from "@pinata/sdk";
import { ApiPromise } from "@polkadot/api";
import { getTxsCollectionSetMetadata } from "./get-txs-collection";
import { TxTypes } from "@/components/util-client";
import { pinImageAndMetadataForOptions } from "../_pinata-utils";
import { getNftAttributesForOptions } from "./util";
import { getTxsForVotes } from "./get-txs-vote";

export const getTxsReferendumRewards = async (
  apiAssetHub: ApiPromise | undefined,
  apiRelay: ApiPromise | undefined,
  apiPinata: PinataClient | null,
  config: RewardConfiguration,
  decoratedVotes: DecoratedConvictionVote[],
  rarityDistribution: RarityDistribution,
  rng: RNG
): Promise<{
  txsAssetHub: any[];
  txsKusama: any[];
  txsPerVote: number;
}> => {
  if (!apiAssetHub || !apiRelay || !apiPinata)
    throw "getTxsReferendumRewards needs defined apis";

  let txsAssetHub: TxTypes[] = [];
  let txsKusama: TxTypes[] = [];

  const { refIndex: referendumIndex } = config;

  // if a new collection was created by the user, we add the txs for pinning and setting the metadata
  if (config.collectionConfig.isNew) {
    const txsCollectionSetMetadata = await getTxsCollectionSetMetadata(
      apiAssetHub,
      apiPinata,
      config
    );
    txsAssetHub = [
      ...txsAssetHub,
      ...txsCollectionSetMetadata.txsAssetHub,
    ];
  }
  //todo lock collection after mint if new collection
  const attributes = getNftAttributesForOptions(
    config.options,
    rarityDistribution
  );

  console.info("rarityDistribution", rarityDistribution);

  // pin metadata and file for each rarity option to Pinata and get nft attributes
  const fileAndMetadataCids = await pinImageAndMetadataForOptions(
    apiPinata,
    config,
    rarityDistribution
  );

  //overwrite file attribute in config with the cid from pinata
  config.options.forEach((option) => {
    option.file =
      "ipfs://ipfs/" + fileAndMetadataCids.imageIpfsCids[option.rarity];

    if (option.fileCover) {
      option.fileCover =
        "ipfs://ipfs/" +
        fileAndMetadataCids.imageIpfsCids[`${option.rarity}_cover`];
    }
  });

  // generate NFT mint txs for each vote(er)
  const txsVotes = getTxsForVotes(
    apiAssetHub,
    config,
    fileAndMetadataCids,
    attributes,
    decoratedVotes,
    rng,
    referendumIndex.toString()
  );

  const txsPerVote = txsVotes.length / decoratedVotes.length;

  txsAssetHub = [...txsAssetHub, ...txsVotes];

  // txsAssetHub = [
  //   apiAssetHub.tx.system.remark(
  //     "Created with https://www.proofofchaos.app/referendum-rewards/"
  //   ),
  // ];

  // const txsKusamaXCM = await getTxsKusamaXCM(
  //   apiRelay,
  //   apiAssetHub,
  //   txsAssetHub
  // );

  // txsKusama = [...txsKusama, ...txsKusamaXCM];

  return { txsAssetHub, txsKusama, txsPerVote };
};
