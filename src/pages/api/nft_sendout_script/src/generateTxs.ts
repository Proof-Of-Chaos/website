import { ApiPromise } from "@polkadot/api";
import { pinImageAndMetadataForOptions } from "../tools/pinataUtils";

import {
  VoteConviction,
  RewardConfiguration,
  RNG,
  RarityDistribution,
  ProcessMetadataResult,
  RewardOption,
  PinImageAndMetadataForOptionsResult,
} from "../types";
import { BN, bnToBn } from "@polkadot/util";
import PinataClient from "@pinata/sdk";
import { createNewCollection } from "./_helpersVote";
import { Logger } from "log4js";

export const getTxsReferendumRewards = async (
  apiStatemine: ApiPromise,
  apiKusama: ApiPromise,
  apiPinata: PinataClient,
  config: RewardConfiguration,
  decoratedVotes: VoteConviction[],
  rarityDistribution: RarityDistribution,
  rng: RNG,
  logger: Logger
): Promise<{
  txsStatemine: any[];
  txsKusama: any[];
}> => {
  let txsStatemine = [];
  let txsKusama = [];

  const { refIndex: referendumIndex } = config;

  const proxyWallet = "D3iNikJw3cPq6SasyQCy3k4Y77ZeecgdweTWoSegomHznG3";
  const proxyWalletSignature = {
    system: {
      Signed: proxyWallet,
    },
  };
  const proxyWalletAdmin = {
    Id: proxyWallet,
  };

  //create collection if required
  config.newCollectionMetadataCid = "";

  if (config.createNewCollection) {
    const txsCreateNewCollection = await getTxsCreateNewCollection(
      apiStatemine,
      apiPinata,
      config,
      proxyWallet
    );

    txsStatemine = [...txsCreateNewCollection];
  } else {
    // use a default collection
  }

  // pin metadata and file for each rarity option to Pinata and get nft attributes

  const fileAndMetadataCids = await pinImageAndMetadataForOptions(
    apiPinata,
    config
  );

  const attributes = getNftAttributesForOptions(
    config.options,
    rarityDistribution
  );

  // logger.info(
  //   "File And Metadata Cids",
  //   JSON.stringify(fileAndMetadataCids, null, 2)
  // );
  // logger.info("NFT attributes", JSON.stringify(attributes, null, 2));

  const todoTestOnlyDecoratedVotes = decoratedVotes.filter((vote) =>
    ["DT7kRjGFvRKxGSx5CPUCA1pazj6gzJ6Db11xmkX4yYSNK7m"].includes(
      vote.address.toString()
    )
  );

  logger.info(
    `🚨🚨🚨  TESTING, filtered votes to only send to ${todoTestOnlyDecoratedVotes.length} votes for referendum ${referendumIndex}`
  );

  // generate NFT mint txs for each vote(er)
  const txsVotes = await getTxsForVotes(
    apiStatemine,
    config,
    fileAndMetadataCids,
    attributes,
    todoTestOnlyDecoratedVotes,
    // decoratedVotes,
    rng,
    referendumIndex.toString(),
    proxyWallet
  );

  txsStatemine = [...txsStatemine, ...txsVotes];

  const txsKusamaXCM = await getTxsKusamaXCM(
    apiKusama,
    apiStatemine,
    txsStatemine
  );

  txsKusama = [...txsKusama, ...txsKusamaXCM];

  return { txsStatemine, txsKusama };
};

//TODO i think this can be without an array and just return the object
const getNftAttributesForOptions = (
  options: RewardOption[],
  rarityDistribution: RarityDistribution
) => {
  let attributes = {};

  for (const option of options) {
    // generate nft attributes
    const nftAttributes = [
      { name: "rarity", value: option.rarity },
      { name: "totalSupply", value: rarityDistribution[option.rarity] },
      { name: "artist", value: option.artist },
      { name: "creativeDirector", value: option.creativeDirector },
      { name: "name", value: option.itemName },
    ];

    const attributesDirect = [
      ...nftAttributes,
      { name: "typeOfVote", value: "direct" },
    ];
    const attributesDelegated = [
      ...nftAttributes,
      { name: "typeOfVote", value: "delegated" },
    ];

    attributes[option.rarity] = {
      direct: attributesDirect,
      delegated: attributesDelegated,
    };
  }

  return attributes;
};

const getTxsKusamaXCM = async (
  apiKusama: ApiPromise,
  apiStatemine: ApiPromise,
  statemineTxs: any[]
) => {
  let txsKusama = [];
  const batchMethodtx = apiStatemine.tx.utility
    .batchAll(statemineTxs)
    .method.toHex();
  const batchtx = apiStatemine.tx.utility.batchAll(statemineTxs).toHex();

  // fs.writeFile(`public/output/${referendumIndex}.json`, batchtx, (err) => {
  //   // In case of a error throw err.
  //   if (err) throw err;
  // });

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

  txsKusama = [
    apiKusama.tx.system.remark(
      "Created with https://www.proofofchaos.app/referendum-rewards/"
    ),
    xcmCall,
  ];

  return txsKusama;
};

const getTxsCreateNewCollection = async (
  apiStatemine: ApiPromise,
  apiPinata: PinataClient,
  config: RewardConfiguration,
  proxyWallet: string
): Promise<any> => {
  const txs = [];

  txs.push(apiStatemine.tx.nfts.create(config.collectionId, proxyWallet));
  config.newCollectionMetadataCid = await createNewCollection(
    apiPinata,
    config
  );
  txs.push(
    apiStatemine.tx.uniques.setCollectionMetadata(
      config.collectionId,
      config.newCollectionMetadataCid
    )
  );
  // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.create(config.collectionId, proxyWallet)))
  // config.newCollectionMetadataCid = await createNewCollection(pinata, account.address, config);
  // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.setCollectionMetadata(config.collectionId, config.newCollectionMetadataCid, false)))

  return txs;
};

export const getTxsForVotes = async (
  apiStatemine: ApiPromise,
  config: RewardConfiguration,
  fileAndMetadataCids: PinImageAndMetadataForOptionsResult,
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

    const selectedMetadata =
      fileAndMetadataCids.metadataIpfsCids[chosenOption.rarity];

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
      console.error(`metadataCid is null. exiting.`);
      return;
    }

    txs.push(
      apiStatemine.tx.nfts.mint(
        config.collectionId,
        i,
        vote.address.toString(),
        null
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "royaltyPercentFloat",
        vote.meetsRequirements ? randRoyaltyInRange : config.defaultRoyalty
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "royaltyReceiver",
        config.royaltyAddress
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "amountLockedInGovernance",
        vote.lockedWithConvictionDecimal
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "voteDirection",
        vote.voteDirection
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "aye",
        vote.balance.aye.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "nay",
        vote.balance.nay.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "abstain",
        vote.balance.abstain.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "delegatedConvictionBalance",
        vote.delegatedConvictionBalance.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "chanceAtEpic",
        vote.chances.epic.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "chanceAtRare",
        vote.chances.rare.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "chanceAtCommon",
        vote.chances.common.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "voter",
        vote.address.toString()
      )
    );
    // txs.push(
    //   apiStatemine.tx.nfts.setAttribute(
    //     config.collectionId,
    //     i,
    //     "CollectionOwner",
    //     "dragonEquipped",
    //     vote.dragonEquipped
    //   )
    // );
    // txs.push(
    //   apiStatemine.tx.nfts.setAttribute(
    //     config.collectionId,
    //     i,
    //     "CollectionOwner",
    //     "quizCorrect",
    //     vote.quizCorrect.toString()
    //   )
    // );
    // txs.push(
    //   apiStatemine.tx.nfts.setAttribute(
    //     config.collectionId,
    //     i,
    //     "CollectionOwner",
    //     "encointerScore",
    //     vote.encointerScore
    //   )
    // );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
        i,
        "CollectionOwner",
        "referendumIndex",
        referendumIndex
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.collectionId,
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
          config.collectionId,
          i,
          "CollectionOwner",
          attribute.name,
          attribute.value
        )
      );
    }

    const ipfsIdentifier = `ipfs://ipfs/${metadataCid}`;

    txs.push(
      apiStatemine.tx.nfts.setMetadata(config.collectionId, i, ipfsIdentifier)
    );
    // txs.push(
    //   apiStatemine.tx.nfts.transfer(
    //     config.collectionId,
    //     i,
    //     vote.address.toString()
    //   )
    // );
  }

  return txs;
};
