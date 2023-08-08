import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import PinataClient from "@pinata/sdk";

import { logger } from "../tools/logger";
import pinataSDK from "@pinata/sdk";

/**
 * Setup Pinata client
 * @returns a Promise<PinataClient> of the Pinata client
 */
export const setupPinata = async (): Promise<PinataClient | null> => {
  const pinata = new pinataSDK(
    process.env.PINATA_API,
    process.env.PINATA_SECRET
  );
  try {
    const result = await pinata.testAuthentication();
    logger.info("🤖 Successfully authenticated with Pinata");
    return pinata;
  } catch (err) {
    logger.info(err);
    throw new Error("Pinata setup failed");
  }
};

/**
 * Get the block number when the referendum was ended
 * @param apiKusama the substrate api
 * @param referendumIndex the referendum index
 * @returns a Promise<BN> of the block number when the referendum was ended
 */
export const getBlockNumber = async (
  apiKusama: ApiPromise,
  referendumIndex: BN
): Promise<BN | null> => {
  try {
    const info = await apiKusama.query.referenda.referendumInfoFor(
      referendumIndex
    );
    const trackJSON = info.toJSON();

    if (
      trackJSON["approved"] ||
      trackJSON["cancelled"] ||
      trackJSON["rejected"] ||
      trackJSON["timedOut"]
    ) {
      let status, confirmationBlockNumber;
      if (trackJSON["approved"]) {
        confirmationBlockNumber = trackJSON["approved"][0];
        status = "Approved";
      } else if (trackJSON["cancelled"]) {
        confirmationBlockNumber = trackJSON["cancelled"][0];
        status = "Cancelled";
      } else if (trackJSON["rejected"]) {
        confirmationBlockNumber = trackJSON["rejected"][0];
        status = "Rejected";
      } else if (trackJSON["timedOut"]) {
        confirmationBlockNumber = trackJSON["timedOut"][0];
        status = "TimedOut";
      }
      return confirmationBlockNumber;
    } else {
      logger.error(`Referendum is still ongoing.`);
      return null;
    }
  } catch (e) {
    logger.error(`Referendum is still ongoing: ${e}`);
    throw new Error(`Referendum is still ongoing: ${e}`);
  }
};
