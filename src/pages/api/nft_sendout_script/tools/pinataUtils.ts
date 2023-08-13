import { Readable } from "stream";
import fs from "fs";
import { PinataPinOptions } from "@pinata/sdk";
import { sleep } from "./utils";
// import { params } from '../config.js';
// import { Metadata } from 'rmrk-tools/dist/tools/types';
import { logger } from "./logger";
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

const fsPromises = fs.promises;
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
      description: option.description,
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
        {
          trait_type: "creativeDirector",
          value: option.creativeDirector,
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
  const { configNFT } = config;
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
  const imageIpfsCid = (
    await pinata.pinFileToIPFS(configNFT.file, pinataFileOptions)
  ).IpfsHash;

  //pin metadata
  const metadata = {
    external_url: "https://www.proofofchaos.app/",
    mediaUri: `ipfs://ipfs/${imageIpfsCid}`,
    image: `ipfs://ipfs/${imageIpfsCid}`,
    name: `Referendum ${config.refIndex} - Config NFT`,
    description: `${configNFT.description}\n\n_This NFT was created with proofofchaos.app/referendum-rewards_`,
  };
  const metadataIpfsCid = (
    await pinata.pinJSONToIPFS(metadata, pinataMetadataOptions)
  ).IpfsHash;

  return {
    imageIpfsCid,
    metadataIpfsCid,
  };
};
