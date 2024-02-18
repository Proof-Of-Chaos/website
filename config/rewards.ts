export type RewardsConfigType = {
  royaltyAddress: string;
  acceptedNftFormats: string[];
  acceptedNonImageFormats: string[];
  maxFileSize: number;
  rewardsFilter: string[];
  NFT_BATCH_SIZE_MAX: number;
};

export const rewardsConfig: RewardsConfigType = {
  // maximum number of txs to call in one batchAll, it is limited by block size
  NFT_BATCH_SIZE_MAX: process.env.NEXT_PUBLIC_BATCH_SIZE_MAX
    ? parseInt(process.env.NEXT_PUBLIC_BATCH_SIZE_MAX)
    : 700,
  //for tetsing, only consider the following addresses for the sendout
  rewardsFilter: process.env.REWARDS_FILTER_ADDRESSES
    ? process.env.REWARDS_FILTER_ADDRESSES.split(",")
    : [],
  royaltyAddress:
    process.env.NEXT_PUBLIC_ROYALTY_ADDRESS ||
    "Go8NpTvzdpfpK1rprXW1tE4TFTHtd2NDJCqZLw5V77GR8r4",
  acceptedNonImageFormats: [
    "video/mp4",
    "video/webp",
    "audio/mp3",
    "audio/mpeg",
    "audio/flac",
    "3d/glb",
  ],
  acceptedNftFormats: [
    "video/mp4",
    "video/webp",
    "audio/mp3",
    "audio/flac",
    "audio/mpeg",
    "3d/glb",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/svg",
    "image/bmp",
  ],
  maxFileSize: 2 * 1024 * 1024,
};
