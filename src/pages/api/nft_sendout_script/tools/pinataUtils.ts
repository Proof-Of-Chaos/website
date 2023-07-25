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
  config: CollectionConfiguration
): Promise<PinImageAndMetadataForCollectionResult> => {

  const pinataFileOptions: PinataPinOptions = {
    pinataMetadata: {
      name: `referendum-${config.refIndex}_${config.name}`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const pinataMetadataOptions: PinataPinOptions = {
    pinataMetadata: {
      name: `referendum-${config.refIndex}_${config.name}_meta`,
      a: "b",
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  //pin image file
  const imageIpfsCid = (await pinata.pinFileToIPFS(
    config.file,
    pinataFileOptions
  )).IpfsHash;

  //pin metadata
  const metadata = {
    external_url: "https://www.proofofchaos.app/",
    mediaUri: `ipfs://ipfs/${imageIpfsCid}`,
    image: `ipfs://ipfs/${imageIpfsCid}`,
    name: `Referendum ${config.refIndex} - ${config.name}`,
    description: config.description,
  };
  const metadataIpfsCid = (await pinata.pinJSONToIPFS(
    metadata,
    pinataMetadataOptions
  )).IpfsHash;

  return {
    imageIpfsCid,
    metadataIpfsCid,
  };
};
