import { logger } from "./logger";
import { BN } from "@polkadot/util";
import fs from "fs";

const fsPromises = fs.promises;

export const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

export const getDragonBonusFile = async (referendumId: BN) => {
  try {
    const bonuses = await fsPromises.readFile(
      `${process.cwd()}/public/dragonBonus/${referendumId}.json`,
      "utf8"
    );
    logger.info(
      `reading bonuses from /public/dragonBonus/${referendumId}.json`
    );
    return bonuses;
  } catch (e) {
    logger.info(`No bonus file specified. Exiting.`);
    throw new Error(
      `No bonus file found at ${process.cwd()}/public/dragonBonus/${referendumId}.json. Exiting.`
    );
  }
};
