import { Readable } from "stream";
import fs from "fs";
import { PinataPinOptions } from "@pinata/sdk";
import { sleep } from "./utils";
// import { params } from '../config.js';
// import { Metadata } from 'rmrk-tools/dist/tools/types';
// import { logger } from "./logger";
import { config } from "process";
import {
  CollectionConfiguration,
  PinImageAndMetadataForCollectionResult,
  PinImageAndMetadataForConfigNFTResult,
  PinImageAndMetadataForOptionsResult,
  ProcessMetadataResult,
  RewardConfiguration,
  RewardOption,
} from "../types";
import pinataSDK from "@pinata/sdk";

const defaultOptions: Partial<PinataPinOptions> = {
  pinataOptions: {
    cidVersion: 1,
  },
};

export type StreamPinata = Readable & {
  path?: string;
};

/**
 * Given a config and a pinata api, pin all the images and metadata for each rarity option
 * @param pinata
 * @param config
 * @returns {Promise<PinImageAndMetadataForOptionsResult>}
 */
export const pinImageAndMetadataForOptions = async (
  pinata: pinataSDK,
  config: RewardConfiguration
): Promise<PinImageAndMetadataForOptionsResult> => {
  const imageIpfsCids = {};
  const metadataIpfsCids = {};

  for (const option of config.options) {
    const pinataFileOptions: PinataPinOptions = {
      pinataMetadata: {
        name: `referendum-${config.refIndex}_${option.rarity}`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const pinataMetadataOptions: PinataPinOptions = {
      pinataMetadata: {
        name: `referendum-${config.refIndex}_${option.rarity}_meta`,
        a: "b",
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    //pin image file
    const imageIpfsCid = await pinata.pinFileToIPFS(
      option.file,
      pinataFileOptions
    );

    imageIpfsCids[option.rarity] = {
      direct: imageIpfsCid.IpfsHash,
      // TODO
      delegated: imageIpfsCid.IpfsHash,
    };

    //TODO what is correct here? Kodadot wants image, but RMRK wants mediaUri
    //pin metadata
    const metadata = {
      external_url: "https://www.proofofchaos.app/",
      mediaUri: `ipfs://ipfs/${imageIpfsCid.IpfsHash}`,
      image: `ipfs://ipfs/${imageIpfsCid.IpfsHash}`,
      name: option.itemName,
      description: `${option.description}\n\n_This NFT was created with [proofofchaos.app](https://proofofchaos.app/referendum-rewards)_`,
      attributes: [
        {
          trait_type: "Rarity",
          value: option.rarity,
        },
        {
          trait_type: "name",
          value: option.itemName,
        },
        {
          trait_type: "description",
          value: option.description,
        },
        {
          trait_type: "artist",
          value: option.artist,
        },
      ],
    };
    const metadataIpfsCid = await pinata.pinJSONToIPFS(
      metadata,
      pinataMetadataOptions
    );
    metadataIpfsCids[option.rarity] = {
      direct: metadataIpfsCid.IpfsHash,
      // TODO
      delegated: metadataIpfsCid.IpfsHash,
    };
  }

  return {
    imageIpfsCids,
    metadataIpfsCids,
  };
};

/**
 * Given a config and a pinata api, pin all the images and metadata for each rarity option
 * @param pinata
 * @param config
 * @returns {Promise<PinImageAndMetadataForOptionsResult>}
 */
export const pinImageAndMetadataForCollection = async (
  pinata: pinataSDK,
  config: RewardConfiguration
): Promise<PinImageAndMetadataForCollectionResult> => {
  const { collectionConfig } = config;
  const pinataFileOptions: PinataPinOptions = {
    pinataMetadata: {
      name: `referendum-${config.refIndex}_${collectionConfig.name}`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const pinataMetadataOptions: PinataPinOptions = {
    pinataMetadata: {
      name: `referendum-${config.refIndex}_${collectionConfig.name}_meta`,
      a: "b",
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  //pin image file
  const imageIpfsCid = (
    await pinata.pinFileToIPFS(collectionConfig.file, pinataFileOptions)
  ).IpfsHash;

  //pin metadata
  const metadata = {
    external_url: "https://www.proofofchaos.app/",
    mediaUri: `ipfs://ipfs/${imageIpfsCid}`,
    image: `ipfs://ipfs/${imageIpfsCid}`,
    name: `Referendum ${config.refIndex} - ${collectionConfig.name}`,
    description: `${collectionConfig.description}\n\n_This collection was created on [proofofchaos.app](https://proofofchaos.app/referendum-rewards)_`,
  };
  const metadataIpfsCid = (
    await pinata.pinJSONToIPFS(metadata, pinataMetadataOptions)
  ).IpfsHash;

  return {
    imageIpfsCid,
    metadataIpfsCid,
  };
};

/**
 * Given a config and a pinata api, pin all the images and metadata for each rarity option
 * @param pinata
 * @param config
 * @returns {Promise<PinImageAndMetadataForConfigNFTResult>}
 */
export const pinMetadataForConfigNFT = async (
  pinata: pinataSDK,
  config: RewardConfiguration
): Promise<PinImageAndMetadataForConfigNFTResult> => {
  const { collectionConfig, configNFT, options, ...configAttributes } = config;
  const pinataFileOptions: PinataPinOptions = {
    pinataMetadata: {
      name: `referendum-${config.refIndex}_configNFT`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const pinataMetadataOptions: PinataPinOptions = {
    pinataMetadata: {
      name: `referendum-${config.refIndex}_configNFT_meta`,
      a: "b",
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  //pin image file
  let imageIpfsCid;

  if (configNFT.imageCid) {
    imageIpfsCid = configNFT.imageCid;
  } else {
    imageIpfsCid = (
      await pinata.pinFileToIPFS(configNFT.file, pinataFileOptions)
    ).IpfsHash;
  }

  let attributes = [];

  for (const attribute in configAttributes) {
    if (attribute === "nftIds" && Array.isArray(configAttributes[attribute])) {
      // Convert the array to a string
      let ids = configAttributes[attribute].map(id => id.toString());

      let counter = 1;
      let chunk = "";

      for (let id of ids) {
        // Check if adding the next ID would exceed 254 characters
        if (chunk.length + id.length + 1 > 254) {
          // Push the current chunk and reset it
          attributes.push({
            trait_type: attribute + "_" + counter,
            value: chunk.slice(0, -1) // Remove trailing comma
          });
          chunk = "";
          counter++;
        }

        chunk += id + ",";
      }

      // Handle any remaining IDs
      if (chunk) {
        attributes.push({
          trait_type: attribute + "_" + counter,
          value: chunk.slice(0, -1) // Remove trailing comma
        });
      }
    } else {
      attributes.push({
        trait_type: attribute,
        value: configAttributes.hasOwnProperty(attribute) ? configAttributes[attribute]?.toString() ?? "" : ""
      });
    }
  }

  //add attributes for all the new collection config
  for (const attribute in collectionConfig) {
    attributes.push({
      trait_type: "collection_" + attribute,
      value: (collectionConfig.hasOwnProperty(attribute))
        ? collectionConfig[attribute]?.toString() ?? ""
        : ""
      ,
    });
  }

  //add attributes for all the configNFT stuff
  for (const attribute in configNFT) {
    attributes.push({
      trait_type: "configNFT_" + attribute,
      value: configNFT.hasOwnProperty(attribute) ? configNFT[attribute]?.toString() ?? "" : "",
    });
  }

  let optionIndex = 0;
  //add attributes for all the reward options
  for (const option of options) {
    for (const attribute in option) {
      attributes.push({
        trait_type: "option_" + optionIndex + "_" + attribute,
        value: option.hasOwnProperty(attribute) ? option[attribute]?.toString() ?? "" : "",
      });
    }
    optionIndex++;
  }

  //pin metadata
  const metadata = {
    external_url: "https://www.proofofchaos.app/",
    mediaUri: imageIpfsCid,
    image: imageIpfsCid,
    name: `Referendum ${config.refIndex} - Config NFT`,
    description: `${configNFT.description}\n\n_This NFT was created with [proofofchaos.app](https://proofofchaos.app/referendum-rewards)_`,
    attributes
  };
  const metadataIpfsCid = (
    await pinata.pinJSONToIPFS(metadata, pinataMetadataOptions)
  ).IpfsHash;

  return {
    imageIpfsCid,
    metadataIpfsCid,
  };
};
