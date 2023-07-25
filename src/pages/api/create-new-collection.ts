import { logger } from "./nft_sendout_script/tools/logger";
import formidable, { errors as formidableErrors } from "formidable";
import fs from "fs";
import {
  getTxsCollectionCreate,
  getTxsCollectionSetMetadata,
} from "./nft_sendout_script/src/createCollection";

/**
 * Handler for the /api/create-new-collection endpoint
 * @param req The request object encoded as URLSearchParams
 * @param res
 */
export default async function handler(req, res) {
  let config;

  const form = formidable({});
  let fields;
  let files;
  let imageFile;
  try {
    [fields, files] = await form.parse(req);

    config = JSON.parse(fields.data);

    const file = files["imageFile"][0];

    console.log("aaaaa api endpoint received", config, "files", files);

    const readableFileStream = fs.createReadStream(file.filepath);
    imageFile = readableFileStream;

    logger.info(
      `🚀 Creating a new NFT collection on Kusama Asset Hub named: ${config.collectionName}`
    );
  } catch (err) {
    console.log("error parsing form", err);
    res.status(400).json({
      name: err.name,
      message: err.message,
    });
  }

  res.status(200).json({
    newCollectionId: 3,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
