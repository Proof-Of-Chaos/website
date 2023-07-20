import { KeyringPair } from "@polkadot/keyring/types";
import { Keyring } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
// import { params } from "../config.js";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Block, RuntimeDispatchInfo } from "@polkadot/types/interfaces";
import { logger } from "./logger";
import { CodecHash, EventRecord } from "@polkadot/types/interfaces";
import { sleep } from "./utils";
import { options } from "../src/encointerAPIOptions";
import { BN } from "@polkadot/util";

// 'wss://staging.node.rmrk.app'

const WS_ENDPOINTS_KUSAMA = [
  "wss://kusama-rpc.polkadot.io",
  "wss://kusama.api.onfinality.io/public-ws",
  "wss://kusama-rpc.dwellir.com",
];

const WS_ENDPOINTS_STATEMINE = [
  "wss://statemine-rpc.polkadot.io",
  "wss://statemine.api.onfinality.io/public-ws",
  "wss://statemine-rpc.dwellir.com",
];

const WS_ENDPOINTS_ENCOINTER = [
  "wss://encointer.api.onfinality.io/public-ws",
  "wss://sys.ibp.network/encointer-kusama",
  "wss://sys.dotters.network/encointer-kusama",
  "wss://kusama.api.enointer.org",
];

const MAX_RETRIES = 15;
const WS_DISCONNECT_TIMEOUT_SECONDS = 20;
const RETRY_DELAY_SECONDS = 20;

let wsProviderKusama: WsProvider;
let polkadotApiKusama: ApiPromise;
let healthCheckInProgressKusama = false;

let wsProviderStatemine: WsProvider;
let polkadotApiStatemine: ApiPromise;
let healthCheckInProgressStatemine = false;

let wsProviderEncointer: WsProvider;
let polkadotApiEncointer: ApiPromise;
let healthCheckInProgressEncointer = false;

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const providerHealthCheckKusama = async (wsEndpoints: string[]) => {
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;
  logger.info(
    `💗 Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider fro rpc ${primaryEndpoint}.`
  );
  healthCheckInProgressKusama = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProviderKusama.isConnected) {
    logger.info(`All good. Connected back to ${primaryEndpoint}`);
    healthCheckInProgressKusama = false;
    return true;
  } else {
    logger.info(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds. Disconnecting from ${primaryEndpoint} and switching to a backup rpc endpoint ${secondaryEndpoint}`
    );
    await wsProviderKusama.disconnect();

    healthCheckInProgressKusama = false;
    throw new Error(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds.`
    );
  }
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const providerHealthCheckStatemine = async (wsEndpoints: string[]) => {
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;
  logger.info(
    `💗 Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider fro rpc ${primaryEndpoint}.`
  );
  healthCheckInProgressStatemine = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProviderStatemine.isConnected) {
    logger.info(`All good. Connected back to ${primaryEndpoint}`);
    healthCheckInProgressStatemine = false;
    return true;
  } else {
    logger.info(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds. Disconnecting from ${primaryEndpoint} and switching to a backup rpc endpoint ${secondaryEndpoint}`
    );
    await wsProviderStatemine.disconnect();

    healthCheckInProgressStatemine = false;
    throw new Error(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds.`
    );
  }
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const providerHealthCheckEncointer = async (wsEndpoints: string[]) => {
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;
  logger.info(
    `💗 Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider fro rpc ${primaryEndpoint}.`
  );
  healthCheckInProgressEncointer = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProviderEncointer.isConnected) {
    logger.info(`All good. Connected back to ${primaryEndpoint}`);
    healthCheckInProgressEncointer = false;
    return true;
  } else {
    logger.info(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds. Disconnecting from ${primaryEndpoint} and switching to a backup rpc endpoint ${secondaryEndpoint}`
    );
    await wsProviderEncointer.disconnect();

    healthCheckInProgressEncointer = false;
    throw new Error(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds.`
    );
  }
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const getProviderKusama = async (wsEndpoints: string[]) => {
  const [primaryEndpoint, ...otherEndpoints] = wsEndpoints;
  return await new Promise<WsProvider | undefined>((resolve, reject) => {
    wsProviderKusama = new WsProvider(primaryEndpoint);
    wsProviderKusama.on("disconnected", async () => {
      logger.info(`⛓️  WS provider for rpc ${primaryEndpoint} disconnected!`);
      if (!healthCheckInProgressKusama) {
        try {
          await providerHealthCheckKusama(wsEndpoints);
          resolve(wsProviderKusama);
        } catch (error: any) {
          reject(error);
        }
      }
    });
    wsProviderKusama.on("connected", () => {
      logger.info(`⛓️  WS provider for rpc ${primaryEndpoint} connected`);
      resolve(wsProviderKusama);
    });
    wsProviderKusama.on("error", async () => {
      logger.info(`⚠️  Error thrown for rpc ${primaryEndpoint}`);
      if (!healthCheckInProgressKusama) {
        try {
          await providerHealthCheckKusama(wsEndpoints);
          resolve(wsProviderKusama);
        } catch (error: any) {
          reject(error);
        }
      }
    });
  });
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const getProviderStatemine = async (wsEndpoints: string[]) => {
  const [primaryEndpoint, ...otherEndpoints] = wsEndpoints;
  return await new Promise<WsProvider | undefined>((resolve, reject) => {
    wsProviderStatemine = new WsProvider(primaryEndpoint);
    wsProviderStatemine.on("disconnected", async () => {
      logger.info(`⛓️  WS provider for rpc ${primaryEndpoint} disconnected!`);
      if (!healthCheckInProgressStatemine) {
        try {
          await providerHealthCheckStatemine(wsEndpoints);
          resolve(wsProviderStatemine);
        } catch (error: any) {
          reject(error);
        }
      }
    });
    wsProviderStatemine.on("connected", () => {
      logger.info(`⛓️  WS provider for rpc ${primaryEndpoint} connected`);
      resolve(wsProviderStatemine);
    });
    wsProviderStatemine.on("error", async () => {
      logger.info(`⚠️  Error thrown for rpc ${primaryEndpoint}`);
      if (!healthCheckInProgressStatemine) {
        try {
          await providerHealthCheckStatemine(wsEndpoints);
          resolve(wsProviderStatemine);
        } catch (error: any) {
          reject(error);
        }
      }
    });
  });
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const getProviderEncointer = async (wsEndpoints: string[]) => {
  const [primaryEndpoint, ...otherEndpoints] = wsEndpoints;
  return await new Promise<WsProvider | undefined>((resolve, reject) => {
    wsProviderEncointer = new WsProvider(primaryEndpoint);
    wsProviderEncointer.on("disconnected", async () => {
      logger.info(`⛓️  WS provider for rpc ${primaryEndpoint} disconnected!`);
      if (!healthCheckInProgressEncointer) {
        try {
          await providerHealthCheckEncointer(wsEndpoints);
          resolve(wsProviderEncointer);
        } catch (error: any) {
          reject(error);
        }
      }
    });
    wsProviderEncointer.on("connected", () => {
      logger.info(`⛓️  WS provider for rpc ${primaryEndpoint} connected`);
      resolve(wsProviderEncointer);
    });
    wsProviderEncointer.on("error", async () => {
      logger.info(`⚠️  Error thrown for rpc ${primaryEndpoint}`);
      if (!healthCheckInProgressEncointer) {
        try {
          await providerHealthCheckEncointer(wsEndpoints);
          resolve(wsProviderEncointer);
        } catch (error: any) {
          reject(error);
        }
      }
    });
  });
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 * @param retry - retry count
 */
export const getApiKusama = async (
  wsEndpoints: string[] = WS_ENDPOINTS_KUSAMA,
  retry = 0
): Promise<ApiPromise> => {
  if (wsProviderKusama && polkadotApiKusama && polkadotApiKusama.isConnected)
    return polkadotApiKusama;
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;

  try {
    const provider = await getProviderKusama(wsEndpoints);
    polkadotApiKusama = await ApiPromise.create({ provider });
    await polkadotApiKusama.isReady;
    return polkadotApiKusama;
  } catch (error: any) {
    if (retry < MAX_RETRIES) {
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      return await getApiKusama(
        [secondaryEndpoint, ...otherEndpoints, primaryEndpoint],
        retry + 1
      );
    } else {
      return polkadotApiKusama;
    }
  }
};

export const getApiStatemine = async (
  wsEndpoints: string[] = WS_ENDPOINTS_STATEMINE,
  retry = 0
): Promise<ApiPromise> => {
  if (
    wsProviderStatemine &&
    polkadotApiStatemine &&
    polkadotApiStatemine.isConnected
  )
    return polkadotApiStatemine;
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;

  try {
    const provider = await getProviderStatemine(wsEndpoints);
    polkadotApiStatemine = await ApiPromise.create({ provider });
    await polkadotApiStatemine.isReady;
    return polkadotApiStatemine;
  } catch (error: any) {
    if (retry < MAX_RETRIES) {
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      return await getApiStatemine(
        [secondaryEndpoint, ...otherEndpoints, primaryEndpoint],
        retry + 1
      );
    } else {
      return polkadotApiStatemine;
    }
  }
};

export const getApiEncointer = async (
  wsEndpoints: string[] = WS_ENDPOINTS_ENCOINTER,
  retry = 0
): Promise<ApiPromise> => {
  if (
    wsProviderEncointer &&
    polkadotApiEncointer &&
    polkadotApiEncointer.isConnected
  )
    return polkadotApiEncointer;
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;

  try {
    const provider = await getProviderEncointer(wsEndpoints);
    polkadotApiEncointer = await ApiPromise.create({ ...options(), provider });
    await polkadotApiEncointer.isReady;
    return polkadotApiEncointer;
  } catch (error: any) {
    if (retry < MAX_RETRIES) {
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      return await getApiEncointer(
        [secondaryEndpoint, ...otherEndpoints, primaryEndpoint],
        retry + 1
      );
    } else {
      return polkadotApiEncointer;
    }
  }
};

export const initAccount = (): KeyringPair => {
  const keyring = new Keyring({ type: "sr25519" });
  const account = keyring.addFromUri(process.env.MNEMONIC);
  return account;
};

export const getLatestFinalizedBlock = async (
  api: ApiPromise
): Promise<number> => {
  const hash = await api.rpc.chain.getFinalizedHead();
  const header = await api.rpc.chain.getHeader(hash);
  if (header.number.toNumber() === 0) {
    logger.error("Unable to retrieve finalized head - returned genesis block");
    process.exit(1);
  }
  return header.number.toNumber();
};

export const extractBlockTime = (extrinsics) => {
  const setTimeExtrinsic = extrinsics.find(
    (ex) => ex.method.section === "timestamp" && ex.method.method === "set"
  );
  if (setTimeExtrinsic) {
    const { args } = setTimeExtrinsic.method.toJSON();
    return args.now;
  }
};

export const getBlockIndexer = (block: Block) => {
  const blockHash = block.hash.toHex();
  const blockHeight = block.header.number.toNumber();
  const blockTime = extractBlockTime(block.extrinsics);

  return {
    blockHeight,
    blockHash,
    blockTime,
  };
};

export const getDecimal = (bigNum: string, chainDecimals: BN) => {
  const base = new BN(10);
  return new BN(bigNum).div(base.pow(chainDecimals)).toNumber();
};

export const getChainDecimals = async (network: string) => {
  let api;
  switch (network) {
    case "kusama":
      api = await getApiKusama();
      break;
    case "encointer":
      api = await getApiEncointer();
      break;
    case "statemine":
      api = await getApiStatemine();
      break;
    default:
      break;
  }
  return new BN(api.registry.chainDecimals);
};

// Returns the denomination of the chain. Used for formatting planck denomianted amounts
export const getDenom = async (): Promise<number> => {
  const api = await getApiKusama();
  const base = new BN(10);
  const denom = base.pow(new BN(api.registry.chainDecimals)).toNumber();
  return denom;
};

export const getApiAt = async (
  network: string,
  blockNumber: number
): Promise<any> => {
  let api;
  switch (network) {
    case "kusama":
      api = await getApiKusama();
      break;
    case "encointer":
      api = await getApiEncointer();
      break;
    case "statemine":
      api = await getApiStatemine();
      break;
    default:
      break;
  }
  const hash = await getBlockHash(network, blockNumber);
  return await api.at(hash);
};

const getBlockHash = async (
  network: string,
  blockNumber: number
): Promise<string> => {
  let api;
  switch (network) {
    case "kusama":
      api = await getApiKusama();
      break;
    case "encointer":
      api = await getApiEncointer();
      break;
    case "statemine":
      api = await getApiStatemine();
      break;
    default:
      break;
  }
  return (await api.rpc.chain.getBlockHash(blockNumber)).toString();
};
