import { generateCalls } from "./nft_sendout_script/src/generateCalls";

export default async function handler(req, res) {
  const config = JSON.parse(req.body);
  const callData = await generateCalls(config);
  res.status(200).json({
    config: config,
    preimage: callData,
  });
}
