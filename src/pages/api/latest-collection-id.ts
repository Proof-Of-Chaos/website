import formidable, { errors as formidableErrors } from "formidable";
import fs from "fs";
import {
  getTxCollectionCreate,
  getUserLatestCollectionId,
} from "./nft_sendout_script/src/createCollection";
import { getApiKusamaAssetHub } from "../../data/chain";

/**
 * Retrieve the latest collection ID for a given account
 * @param req The request object encoded as URLSearchParams
 * @param res
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { address } = req.body;
    const apiKusamaAssetHub = await getApiKusamaAssetHub();

    try {
      getUserLatestCollectionId(apiKusamaAssetHub, address);
    } catch (err) {
      console.log("error parsing form", err);
      res.status(400).json({
        name: err.name,
        message: err.message,
      });
    }

    res.status(200).json({});
  } else {
    res.status(405).json({
      name: "Method not allowed",
      message: "Only POST requests are allowed",
    });
  }
}
