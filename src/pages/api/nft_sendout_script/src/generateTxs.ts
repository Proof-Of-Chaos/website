import { ApiPromise } from "@polkadot/api";
import { pinImageAndMetadataForOptions } from "../tools/pinataUtils";
import crypto from "crypto";
import { websiteConfig } from "../../../../data/website-config";

import {
  VoteConviction,
  RewardConfiguration,
  RNG,
  RarityDistribution,
  RewardOption,
  PinImageAndMetadataForOptionsResult,
} from "../types";
import PinataClient from "@pinata/sdk";
// import { Logger } from "log4js";
import { getTxsCollectionSetMetadata } from "./createCollection";

export const getTxsReferendumRewards = async (
  apiKusamaAssetHub: ApiPromise,
  apiKusama: ApiPromise,
  apiPinata: PinataClient,
  config: RewardConfiguration,
  decoratedVotes: VoteConviction[],
  rarityDistribution: RarityDistribution,
  rng: RNG
  // logger: Logger
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

  // if a new collection was created by the user, we add the txs for pinning and setting the metadata
  if (config.collectionConfig.isNew) {
    const txsCollectionSetMetadata = await getTxsCollectionSetMetadata(
      apiKusamaAssetHub,
      apiPinata,
      config
    );
    txsKusamaAssetHub = [
      ...txsKusamaAssetHub,
      ...txsCollectionSetMetadata.txsKusamaAssetHub,
    ];
  }
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

  //overwrite file attribute in config with the cid from pinata
  config.options.forEach((option) => {
    option.file =
      "ipfs://ipfs/" + fileAndMetadataCids.imageIpfsCids[option.rarity].direct;
  });

  // generate NFT mint txs for each vote(er)
  const txsVotes = getTxsForVotes(
    apiKusamaAssetHub,
    config,
    fileAndMetadataCids,
    attributes,
    decoratedVotes,
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
      { name: "name", value: option.itemName },
      { name: "description", value: option.description },
    ];

    if (option.artist) {
      nftAttributes.push({ name: "artist", value: option.artist });
    }

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

const bigIntMod = (hash: string, mod: number): number => {
  let result = 0;

  for (let i = 0; i < hash.length; i++) {
    result = (result * 16 + parseInt(hash[i], 16)) % mod;
  }

  return result;
};

export const generateNFTId = (
  timestamp: number,
  senderAddress?: string,
  referendum?: string,
  index?: number
): number => {
  // Create an array to store the input components
  const inputComponents = [];

  // Push non-null arguments to the inputComponents array
  if (senderAddress !== undefined) {
    inputComponents.push(senderAddress);
  }
  if (referendum !== undefined) {
    inputComponents.push(referendum);
  }

  // Timestamp is always required, no need to check for null
  inputComponents.push(timestamp.toString());

  if (index !== undefined) {
    inputComponents.push(index.toString());
  }

  // Combine the input components into a single string
  const inputString = inputComponents.join("-");
  // Generate a SHA256 hash of the input string
  const hash = crypto.createHash("sha256").update(inputString).digest("hex");
  // Convert the hash to a 32-bit unsigned integer
  const id = bigIntMod(hash, Math.pow(2, 32));
  return id;
};

export const getTxsForVotes = (
  apiKusamaAssetHub: ApiPromise,
  config: RewardConfiguration,
  fileAndMetadataCids: PinImageAndMetadataForOptionsResult,
  attributes,
  decoratedVotes: VoteConviction[],
  rng: RNG,
  referendumIndex: string,
  proxyWallet: string
): any => {
  const txs = [];
  const timestamp = Date.now();
  let ids = [];
  for (let i = 0; i < decoratedVotes.length; i++) {
    const vote = decoratedVotes[i];

    // the rarity option that was chosen for the voter
    const { chosenOption } = vote;

    const nftId = generateNFTId(
      timestamp,
      config.sender.toString(),
      referendumIndex,
      i
    );

    ids.push(nftId);

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
        config.collectionConfig.id,
        nftId,
        vote.address.toString(),
        null
      )
    );

    txs.push(
      ...getAllSetAttributeTxs(
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
        config.collectionConfig.id,
        nftId,
        ipfsIdentifier
      )
    );
    // txs.push(
    //   apiKusamaAssetHub.tx.nfts.transfer(
    //     config.collectionConfig.id,
    //     nftId,
    //     vote.address.toString()
    //   )
    // );
  }
  config.nftIds = ids;
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

  let attributesToSet = [
    ["image", imageCid],
    ["referendum", referendumIndex],
    ["meetsRequirements", vote.meetsRequirements],
    ["voter", vote.address.toString()],
    ["amountLockedInGovernance", vote.lockedWithConvictionDecimal],
    ["voteDirection", vote.voteDirection],
    ["delegatedConvictionBalance", vote.delegatedConvictionBalance.toString()],
    ["delegatedTo", vote.delegatedTo?.toString()],

    // single account royalties (kodadot friendly)
    [
      "royalty",
      vote.meetsRequirements ? randRoyaltyInRange : config.defaultRoyalty,
    ],
    [
      "recipient",
      JSON.stringify([
        [config.royaltyAddress, 80],
        ["Go8NpTvzdpfpK1rprXW1tE4TFTHtd2NDJCqZLw5V77GR8r4", 20],
      ]),
    ],

    // ["aye", vote.balance.aye.toString()],
    // ["nay", vote.balance.nay.toString()],
    // ["abstain", vote.balance.abstain.toString()],
    // ["chanceAtEpic", vote.chances.epic.toString()],
    // ["chanceAtRare", vote.chances.rare.toString()],
    // ["chanceAtCommon", vote.chances.common.toString()],

    // ["dragonEquipped", vote.dragonEquipped],
    // ["quizCorrect", vote.quizCorrect.toString()],
    // ["encointerScore", vote.encointerScore],

    // TODO this was rmrk style ?
    // ["royaltyPercentFloat", vote.meetsRequirements ? randRoyaltyInRange : 0],
    // ["royaltyReceiver", config.royaltyAddress],
  ];

  for (const [key, value] of attributesToSet) {
    txs.push(
      apiKusamaAssetHub.tx.nfts.setAttribute(
        config.collectionConfig.id,
        nftId,
        "CollectionOwner",
        key,
        value
      )
    );
  }

  for (const attribute of vote.voteType == "Delegating"
    ? attributes[chosenOption.rarity].delegated
    : attributes[chosenOption.rarity].direct) {
    txs.push(
      apiKusamaAssetHub.tx.nfts.setAttribute(
        config.collectionConfig.id,
        nftId,
        "CollectionOwner",
        attribute.name,
        attribute.value
      )
    );
  }

  return txs;
};
