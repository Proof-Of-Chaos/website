import { generateCalls } from "./nft_sendout_script/src/generateCalls";

export default async function handler(req, res) {
  const config = JSON.parse(req.body);
  try {
    const { call, distribution } = await generateCalls(config);
    console.log(call, distribution);
    res.status(200).json({
      config: config,
      preimage: call,
    });
  } catch (error) {
    // Sends error to the client side
    console.trace(error);
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
  }
}
