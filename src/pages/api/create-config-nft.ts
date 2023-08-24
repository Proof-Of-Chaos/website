import { NextApiRequest, NextApiResponse } from "next";
import { setupPinata } from "./nft_sendout_script/src/_helpersApi";
import { createConfigNFT } from "./nft_sendout_script/src/_helpersVote";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const config = JSON.parse(req.body);

    const apiPinata = await setupPinata();
    const result = await createConfigNFT(apiPinata, config);

    // TODO make this secure

    console.log("create-confing-nft result", result);
    res.status(200).json({
      result,
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid JSON" });
  }
}
