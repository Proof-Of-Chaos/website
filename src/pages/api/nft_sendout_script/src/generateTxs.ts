import { ApiPromise } from "@polkadot/api";
import { pinSingleMetadataFromDir } from "../tools/pinataUtils";

import {
  VoteConviction,
  RewardConfiguration,
  RNG,
  RarityDistribution,
  ProcessMetadataResult,
  RewardOption,
} from "../types";
import { BN, bnToBn } from "@polkadot/util";
import PinataClient from "@pinata/sdk";
import { createNewCollection } from "./_helpersVote";

export const getTxsReferendumRewards = async (
  apiStatemine: ApiPromise,
  apiKusama: ApiPromise,
  apiPinata: PinataClient,
  config: RewardConfiguration,
  decoratedVotes: VoteConviction[],
  rarityDistribution: RarityDistribution,
  rng: RNG
): Promise<{
  txsStatemine: any[];
  txsKusama: any[];
}> => {
  let txsStatemine = [];
  let txsKusama = [];

  const { refIndex: referendumIndex } = config;
  let itemCollectionId;

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

    txsStatemine = [...txsStatemine, ...txsCreateNewCollection];
  } else {
    // TODO use a default collection
  }

  const { metadataCids, attributes } = await processMetadataForOptions(
    config,
    apiPinata,
    bnToBn(referendumIndex),
    rarityDistribution
  );

  const txsVotes = await getTxsForVotes(
    apiStatemine,
    config,
    metadataCids,
    attributes,
    decoratedVotes,
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

  txs.push(
    apiStatemine.tx.nfts.create(config.newCollectionSymbol, proxyWallet)
  );
  config.newCollectionMetadataCid = await createNewCollection(
    apiPinata,
    config
  );
  txs.push(
    apiStatemine.tx.uniques.setCollectionMetadata(
      config.newCollectionSymbol,
      config.newCollectionMetadataCid
    )
  );
  // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.create(config.newCollectionSymbol, proxyWallet)))
  // config.newCollectionMetadataCid = await createNewCollection(pinata, account.address, config);
  // txs.push(apiStatemine.tx.utility.dispatchAs(proxyWalletSignature, apiStatemine.tx.uniques.setCollectionMetadata(config.newCollectionSymbol, config.newCollectionMetadataCid, false)))

  return txs;
};

export const getTxsForVotes = async (
  apiStatemine: ApiPromise,
  config: RewardConfiguration,
  metadataCids,
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

    const selectedMetadata = metadataCids[chosenOption.rarity];

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
        config.newCollectionSymbol,
        i,
        vote.address.toString(),
        null
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "royaltyPercentFloat",
        vote.meetsRequirements ? randRoyaltyInRange : config.defaultRoyalty
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "royaltyReceiver",
        "DhvRNnnsyykGpmaa9GMjK9H4DeeQojd5V5qCTWd1GoYwnTc"
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "amountLockedInGovernance",
        vote.lockedWithConvictionDecimal
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "voteDirection",
        vote.voteDirection
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "aye",
        vote.balance.aye.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "nay",
        vote.balance.nay.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "abstain",
        vote.balance.abstain.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "delegatedConvictionBalance",
        vote.delegatedConvictionBalance.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "chanceAtEpic",
        vote.chances.epic.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "chanceAtRare",
        vote.chances.rare.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "chanceAtCommon",
        vote.chances.common.toString()
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "voter",
        vote.address.toString()
      )
    );
    // txs.push(
    //   apiStatemine.tx.nfts.setAttribute(
    //     config.newCollectionSymbol,
    //     i,
    //     "CollectionOwner",
    //     "dragonEquipped",
    //     vote.dragonEquipped
    //   )
    // );
    // txs.push(
    //   apiStatemine.tx.nfts.setAttribute(
    //     config.newCollectionSymbol,
    //     i,
    //     "CollectionOwner",
    //     "quizCorrect",
    //     vote.quizCorrect.toString()
    //   )
    // );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "encointerScore",
        vote.encointerScore
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
        i,
        "CollectionOwner",
        "referendumIndex",
        referendumIndex
      )
    );
    txs.push(
      apiStatemine.tx.nfts.setAttribute(
        config.newCollectionSymbol,
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
          config.newCollectionSymbol,
          i,
          "CollectionOwner",
          attribute.name,
          attribute.value
        )
      );
    }
    txs.push(
      apiStatemine.tx.nfts.setMetadata(
        config.newCollectionSymbol,
        i,
        metadataCid
      )
    );
    // txs.push(
    //   apiStatemine.tx.nfts.transfer(
    //     config.newCollectionSymbol,
    //     i,
    //     vote.address.toString()
    //   )
    // );
  }

  return txs;
};

// Function to pin metadata for each rarity option to Pinata
const processMetadataForOptions = async (
  config: RewardConfiguration,
  pinata: ReturnType<typeof pinataSDK>,
  referendumIndex: BN,
  rarityDistribution: RarityDistribution
): Promise<ProcessMetadataResult> => {
  let metadataCids = {};
  let attributes = {};

  for (const option of config.options) {
    const attributesDirect = generateAttributes(
      option,
      "direct",
      rarityDistribution[option.rarity]
    );
    const metadataCidDirect = await pinSingleMetadataFromDir(
      pinata,
      "/public/referenda",
      option.main,
      `Referendum ${referendumIndex}`,
      { description: option.text }
    );
    option.metadataCidDirect = metadataCidDirect;

    const attributesDelegated = generateAttributes(
      option,
      "delegated",
      rarityDistribution[option.rarity]
    );
    const metadataCidDelegated = await pinSingleMetadataFromDir(
      pinata,
      "/public/referenda",
      option.main,
      `Referendum ${referendumIndex}`,
      { description: option.text }
    );
    option.metadataCidDelegated = metadataCidDelegated;

    if (!metadataCidDirect || !metadataCidDelegated) {
      console.error(
        `one of metadataCids is null: dir: ${metadataCidDirect} del: ${metadataCidDelegated}. exiting.`
      );
      return;
    }

    metadataCids[option.rarity] = {
      direct: metadataCidDirect,
      delegated: metadataCidDelegated,
    };
    attributes[option.rarity] = {
      direct: attributesDirect,
      delegated: attributesDelegated,
    };
  }
  return { metadataCids, attributes };
};

// Function to generate attributes for direct and delegated options
const generateAttributes = (
  option: RewardOption,
  typeOfVote: string,
  totalSupplyOfOption: number
): { name: string; value: string | number }[] => {
  return [
    { name: "rarity", value: option.rarity },
    { name: "totalSupply", value: totalSupplyOfOption },
    { name: "artist", value: option.artist },
    { name: "creativeDirector", value: option.creativeDirector },
    { name: "name", value: option.itemName },
    { name: "typeOfVote", value: typeOfVote },
  ];
};
