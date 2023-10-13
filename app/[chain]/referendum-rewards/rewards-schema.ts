import { titleCase } from "@/components/util";
import { rewardsConfig } from "@/config/rewards";
import { ChainConfig, SubstrateChain } from "@/types";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { z } from "zod";
import { RewardCriteria, SendAndFinalizeResult } from "./types";
import { getChainByName, getChainInfo } from "@/config/chains";
import { getChain } from "@/app/vote/server-actions/get-chain";

export function validateAddress(address: string, ss58Format: number) {
  try {
    decodeAddress(address, false, ss58Format);
  } catch (error) {
    return false;
  }
  return true;
}

const fileUploadOptional =
  typeof window === "undefined"
    ? z
        .any()
        .refine(
          (file) => file?.length === 0 || file?.size <= 2 * 1024 * 1024,
          `File of max size 2MB, if you need larger files use ipfs option`
        )
        .optional()
        .refine(
          (file) =>
            file?.length === 0 ||
            rewardsConfig.acceptedNftFormats.includes(file?.type),
          "File Format not supported"
        )
        .optional()
    : z
        .any()
        .refine(
          (files) => files?.length === 0 || files?.[0]?.size <= 2 * 1024 * 1024,
          `File of max size 2MB, if you need larger files use ipfs option`
        )
        .optional()
        .refine(
          (files) =>
            files?.length === 0 ||
            rewardsConfig.acceptedNftFormats.includes(files?.[0]?.type),
          "File Format not supported"
        )
        .optional();

// this is needed because on client side we have a FileList and on server side we have a File
// however next does not support FileList / File on server side so this workaround is needed
const fileUpload =
  typeof window === "undefined"
    ? z
        .any()
        .refine(
          (file) => file?.length === 0 || file?.size <= 2 * 1024 * 1024,
          `File of max size 2MB, if you need larger files use ipfs option`
        )
        .refine(
          (file) =>
            file?.length === 0 ||
            rewardsConfig.acceptedNftFormats.includes(file?.type),
          "File Format not supported"
        )
    : z
        .any()
        .refine(
          (files) => files?.length === 0 || files?.[0]?.size <= 2 * 1024 * 1024,
          `File of max size 2MB, if you need larger files use ipfs option`
        )
        .refine(
          (files) =>
            files?.length === 0 ||
            rewardsConfig.acceptedNftFormats.includes(files?.[0]?.type),
          "File Format not supported"
        );

export const zodSchemaObject = (
  chain: SubstrateChain,
  userAddress: string | undefined,
  ss58Format: number
) => {
  return {
    chain: z.nativeEnum(SubstrateChain).default(SubstrateChain.Kusama),
    criteria: z.nativeEnum(RewardCriteria, {
      required_error: "Please select a criteria",
    }),
    refIndex: z.string().min(1, "Please select a referendum"),
    royaltyAddress: z.custom<string>(
      (value) => validateAddress(value as string, ss58Format),
      `Not a valid ${titleCase(chain)} asset hub address`
    ),
    collectionConfig: z.object({
      id: z
        .any()
        .transform((id) => parseInt(id) || -1)
        .refine((id) => id >= 0, "Id must be a positive number")
        .refine(async (id) => {
          const { assetHubApi } = await getChainByName(chain);
          await assetHubApi?.isReady;

          if (id >= 0) {
            const collectionData = await assetHubApi?.query.nfts.collection(id);
            const encodedAddress =
              userAddress && encodeAddress(userAddress, ss58Format);

            const ownsCollection =
              (collectionData?.toJSON() as any)?.owner === encodedAddress;

            return ownsCollection;
          } else {
            return false;
          }
        }, "You do not own this collection"),
      name: z.string().optional(),
      description: z.string().optional(),
      // TODO
      // name: z.string().min(1, "Name is required"),
      // description: z.string().min(1, "Description is required"),
      isNew: z.boolean().default(false),
      file: fileUploadOptional,
    }),
    options: z.array(
      z
        .object({
          rarity: z.string(),
          title: z.string().min(1, "Title is required"),
          description: z.string().optional(),
          artist: z.string().optional(),
          imageCid: z.string().optional(),
          //TODO
          file: fileUpload,
          fileCover: fileUpload.optional(),
          coverCid: z.string().optional(),
        })
        .refine(
          (option) => {
            const isImageDefined = option.file?.length > 0;
            const isCidSet =
              option.imageCid !== undefined && option.imageCid !== "";
            const isEitherSet = isImageDefined || isCidSet;
            if (isEitherSet) {
              return true;
            }
            return false;
          },
          {
            message: "Either Image or file is required",
            path: ["file"],
          }
        )
        .refine(
          (option) => {
            const isImageDefined = option.file?.length > 0;
            const isCidSet =
              option.imageCid !== undefined && option.imageCid !== "";
            const isEitherSet = isImageDefined || isCidSet;
            if (isEitherSet) {
              return true;
            }
            return false;
          },
          {
            message: "Either Image or file is required",
            path: ["imageCid"],
          }
        )
    ),
  };
};

// validation schema for rewards form
export const rewardsSchema = (
  chain: SubstrateChain,
  userAddress: string | undefined,
  ss58Format: number
) => {
  const obj = zodSchemaObject(chain, userAddress, ss58Format);
  return z.object(obj);
};
