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
import { Logger } from "log4js";
import { time } from "console";

export const getTxsReferendumRewards = async (
  apiKusamaAssetHub: ApiPromise,
  apiKusama: ApiPromise,
  apiPinata: PinataClient,
  config: RewardConfiguration,
  decoratedVotes: VoteConviction[],
  rarityDistribution: RarityDistribution,
  rng: RNG,
  logger: Logger
): Promise<{
  txsKusamaAssetHub: any[];
  txsKusama: any[];
}> => {
  let txsKusamaAssetHub = [];
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

  //todo setMetadata of Collection
  //todo lock collection after mint if new collection

  const attributes = getNftAttributesForOptions(
    config.options,
    rarityDistribution
  );

  // pin metadata and file for each rarity option to Pinata and get nft attributes
  const fileAndMetadataCids = await pinImageAndMetadataForOptions(
    apiPinata,
    config
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
    apiKusamaAssetHub,
    config,
    fileAndMetadataCids,
    attributes,
    todoTestOnlyDecoratedVotes,
    // decoratedVotes,
    rng,
    referendumIndex.toString(),
    proxyWallet
  );

  txsKusamaAssetHub = [...txsKusamaAssetHub, ...txsVotes];

  // txsKusamaAssetHub = [
  //   apiKusamaAssetHub.tx.system.remark(
  //     "Created with https://www.proofofchaos.app/referendum-rewards/"
  //   ),
  // ];

  const txsKusamaXCM = await getTxsKusamaXCM(
    apiKusama,
    apiKusamaAssetHub,
    txsKusamaAssetHub
  );

  txsKusama = [...txsKusama, ...txsKusamaXCM];

  return { txsKusamaAssetHub, txsKusama };
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
      { name: "description", value: option.description },
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
  apiKusamaAssetHub: ApiPromise,
  assetHubTxs: any[]
) => {
  let txsKusama = [];
  const batchMethodtx = apiKusamaAssetHub.tx.utility
    .batchAll(assetHubTxs)
    .method.toHex();
  const batchtx = apiKusamaAssetHub.tx.utility.batchAll(assetHubTxs).toHex();

  // fs.writeFile(`public/output/${referendumIndex}.json`, batchtx, (err) => {
  //   // In case of a error throw err.
  //   if (err) throw err;
  // });

  //determine refTime + proofSize
  const requiredWeight = (
    await apiKusamaAssetHub.call.transactionPaymentCallApi.queryCallInfo(
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

export const getTxsForVotes = async (
  apiKusamaAssetHub: ApiPromise,
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

    const rarityIndex = config.options.findIndex(
      (option) => option.rarity == chosenOption.rarity
    );

    const nftId = bnToBn(
      `${config.refIndex}${rarityIndex}${Math.floor(Math.random() * 100000)}`
    );

    console.info(
      `📤  ${vote.address.toString()} will get ${nftId} with rarity ${
        chosenOption.rarity
      } and nftId ${nftId}`
    );

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

    if (!metadataCid) {
      console.error(`metadataCid is null. exiting.`);
      return;
    }

    txs.push(
      apiKusamaAssetHub.tx.nfts.mint(
        config.collectionId,
        nftId,
        vote.address.toString(),
        null
      )
    );

    txs.push(
      getAllSetAttributeTxs(
        apiKusamaAssetHub,
        config,
        fileAndMetadataCids,
        attributes,
        vote,
        nftId,
        chosenOption,
        rng
      )
    );

    const ipfsIdentifier = `ipfs://ipfs/${metadataCid}`;

    txs.push(
      apiKusamaAssetHub.tx.nfts.setMetadata(
        config.collectionId,
        nftId,
        ipfsIdentifier
      )
    );
    // txs.push(
    //   apiKusamaAssetHub.tx.nfts.transfer(
    //     config.collectionId,
    //     nftId,
    //     vote.address.toString()
    //   )
    // );
  }

  return txs;
};

const getAllSetAttributeTxs = (
  apiKusamaAssetHub: ApiPromise,
  config: RewardConfiguration,
  fileAndMetadataCids: PinImageAndMetadataForOptionsResult,
  attributes,
  vote: VoteConviction,
  nftId,
  chosenOption,
  rng: RNG
) => {
  let txs = [];

  const { refIndex: referendumIndex } = config;

  const randRoyaltyInRange = Math.floor(
    rng() * (chosenOption.maxRoyalty - chosenOption.minRoyalty + 1) +
      chosenOption.minRoyalty
  );

  const imageCid = `ipfs://ipfs/${
    fileAndMetadataCids.imageIpfsCids[chosenOption.rarity][
      vote.voteType == "Delegating" ? "delegated" : "direct"
    ]
  }`;

  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "image",
      imageCid
    )
  );

  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "amountLockedInGovernance",
      vote.lockedWithConvictionDecimal
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "voteDirection",
      vote.voteDirection
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "aye",
      vote.balance.aye.toString()
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "nay",
      vote.balance.nay.toString()
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "abstain",
      vote.balance.abstain.toString()
    )
  );
  // txs.push(
  //   apiKusamaAssetHub.tx.nfts.setAttribute(
  //     config.collectionId,
  //     nftId,
  //     "CollectionOwner",
  //     "delegatedConvictionBalance",
  //     vote.delegatedConvictionBalance.toString()
  //   )
  // );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "chanceAtEpic",
      vote.chances.epic.toString()
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "chanceAtRare",
      vote.chances.rare.toString()
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "chanceAtCommon",
      vote.chances.common.toString()
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "voter",
      vote.address.toString()
    )
  );
  // txs.push(
  //   apiKusamaAssetHub.tx.nfts.setAttribute(
  //     config.collectionId,
  //     nftId,
  //     "CollectionOwner",
  //     "dragonEquipped",
  //     vote.dragonEquipped
  //   )
  // );
  // txs.push(
  //   apiKusamaAssetHub.tx.nfts.setAttribute(
  //     config.collectionId,
  //     nftId,
  //     "CollectionOwner",
  //     "quizCorrect",
  //     vote.quizCorrect.toString()
  //   )
  // );
  // txs.push(
  //   apiKusamaAssetHub.tx.nfts.setAttribute(
  //     config.collectionId,
  //     nftId,
  //     "CollectionOwner",
  //     "encointerScore",
  //     vote.encointerScore
  //   )
  // );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "referendum",
      referendumIndex
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "meetsRequirements",
      vote.meetsRequirements
    )
  );
  for (const attribute of vote.voteType == "Delegating"
    ? attributes[chosenOption.rarity].delegated
    : attributes[chosenOption.rarity].direct) {
    txs.push(
      apiKusamaAssetHub.tx.nfts.setAttribute(
        config.collectionId,
        nftId,
        "CollectionOwner",
        attribute.name,
        attribute.value
      )
    );
  }

  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "royaltyPercentFloat",
      vote.meetsRequirements ? randRoyaltyInRange : config.defaultRoyalty
    )
  );
  txs.push(
    apiKusamaAssetHub.tx.nfts.setAttribute(
      config.collectionId,
      nftId,
      "CollectionOwner",
      "royaltyReceiver",
      config.royaltyAddress
    )
  );
};
