import { generateCalls } from "./nft_sendout_script/src/generateCalls";

export default async function handler(req, res) {
  const config = JSON.parse(req.body);
  console.log("in api:", config);
  try {
    const {call, epic_count, rare_count, common_count} = await generateCalls(config);
    console.log(call, epic_count, rare_count, common_count)
    res.status(200).json({
      config: config,
      preimage: call,
    });
  } catch (error) {
    // Sends error to the client side
    console.trace(error);
    console.log("🚫 we are definately here", error.message);
    res.status(400).json({
      name: error.name,
      message: error.message,
    });
  }
}
