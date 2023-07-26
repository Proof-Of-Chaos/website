import "@polkadot/rpc-augment";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { Block } from "@polkadot/types/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";

const CHAIN = {
  KUSAMA: "kusama",
  KUSAMA_ASSET_HUB: "kusamaAssetHub",
  ENCOINTER: "encointer",
};

export const WS_ENDPOINTS = {
  [CHAIN.KUSAMA]: [
    "wss://kusama.api.onfinality.io/public-ws",
    "wss://kusama-rpc.dwellir.com",
    "wss://kusama-rpc.polkadot.io",
  ],
  [CHAIN.KUSAMA_ASSET_HUB]: [
    "wss://rpc-asset-hub-kusama.luckyfriday.io",
    "wss://kusama-asset-hub-rpc.polkadot.io",
    "wss://statemine.api.onfinality.io/public-ws",
  ],
  [CHAIN.ENCOINTER]: [
    "wss://kusama.api.enointer.org",
    "wss://encointer.api.onfinality.io/public-ws",
    "wss://sys.ibp.network/encointer-kusama",
    "wss://sys.dotters.network/encointer-kusama",
  ],
};

const MAX_RETRIES = 15;
const WS_DISCONNECT_TIMEOUT_SECONDS = 20;

let wsProviders = {
  [CHAIN.KUSAMA]: undefined,
  [CHAIN.KUSAMA_ASSET_HUB]: undefined,
  [CHAIN.ENCOINTER]: undefined,
};

let apis = {
  [CHAIN.KUSAMA]: undefined,
  [CHAIN.KUSAMA_ASSET_HUB]: undefined,
  [CHAIN.ENCOINTER]: undefined,
};

let healthCheckInProgress = {
  [CHAIN.KUSAMA]: false,
  [CHAIN.KUSAMA_ASSET_HUB]: false,
  [CHAIN.ENCOINTER]: false,
};

/**
 * @see https://polkadot.js.org/docs/api/cookbook/tx
 * @param {*} api
 * @param {*} tx
 * @param {*} signer
 * @param {*} address
 * @returns
 */
export const sendAndFinalize = async (
  api,
  tx: SubmittableExtrinsic<any>[] | SubmittableExtrinsic<any>,
  signer,
  address
) => {
  return new Promise(async (resolve, reject) => {
    await api.isReady;

    // if someone passes a hex encoded tx we need to decode it
    const maybeHexTxToSubmittable = (tx) => {
      if (typeof tx === "string") {
        return api.tx(tx);
      }
      return tx;
    };

    let call;

    if (Array.isArray(tx)) {
      const txs = tx.map(maybeHexTxToSubmittable);
      call = api.tx.utility.batchAll(txs);
    } else {
      call = maybeHexTxToSubmittable(tx);
    }

    console.log("call", call);

    try {
      const unsub = await call.signAndSend(
        address,
        { signer: signer },
        ({ status, dispatchError }) => {
          if (status.isInBlock) {
            console.log("transaction in block waiting for finalization");
          } else if (status.isFinalized) {
            console.log(
              `Transaction included at blockHash ${status.asFinalized}`
            );

            // Loop through Vec<EventRecord> to display all events
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(
                  dispatchError.asModule
                );
                const { docs, name, section } = decoded;

                reject(docs.join(" "));
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                reject(dispatchError.toString());
              }
            } else {
              resolve(`success signAndSend ${tx.toString()}`);
            }
            unsub();
          }
        }
      );
    } catch (err) {
      console.error(err);
      reject("signAndSend cancelled");
    }
  });
};

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(() => {}), ms);
  });
}

export async function getApiKusama(): Promise<ApiPromise> {
  return getApi(CHAIN.KUSAMA);
}

export async function getApiKusamaAssetHub(): Promise<ApiPromise> {
  return getApi(CHAIN.KUSAMA_ASSET_HUB);
}

export async function getApiEncointer(): Promise<ApiPromise> {
  return getApi(CHAIN.ENCOINTER);
}

export async function getApi(chain: string, retry = 0): Promise<ApiPromise> {
  const chainProvider = wsProviders[chain];
  const chainApi = apis[chain];

  if (chainProvider && chainApi) {
    // console.log("returning api from cache for chain", chain);
    return chainApi;
  }

  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] =
    WS_ENDPOINTS[chain];

  try {
    const provider = await getProvider(chain);
    apis[chain] = await ApiPromise.create({ provider });
    await apis[chain].isReady;
    return apis[chain];
  } catch (error) {
    if (retry < MAX_RETRIES) {
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      WS_ENDPOINTS[chain] = [
        secondaryEndpoint,
        ...otherEndpoints,
        primaryEndpoint,
      ];
      return await getApi(chain, retry + 1);
    } else {
      return apis[chain];
    }
  }
}

async function getProvider(chain: string, endpointIndex = 0) {
  const primaryEndpoint = WS_ENDPOINTS[chain][endpointIndex];

  if (wsProviders[chain]) return wsProviders[chain];

  return await new Promise((resolve, reject) => {
    wsProviders[chain] = new WsProvider(primaryEndpoint);
    wsProviders[chain].on("disconnected", async () => {
      console.log(`⛓️  WS provider for rpc ${primaryEndpoint} disconnected!`);
      if (!healthCheckInProgress) {
        try {
          await providerHealthCheck(primaryEndpoint);
          resolve(wsProviders[chain]);
        } catch (error) {
          reject(error);
        }
      }
    });
    wsProviders[chain].on("connected", () => {
      console.log(`WS provider for rpc ${primaryEndpoint} connected`);
      resolve(wsProviders[chain]);
    });
    wsProviders[chain].on("error", async () => {
      console.log(`Error thrown for rpc ${primaryEndpoint}`);
      if (!healthCheckInProgress) {
        try {
          await providerHealthCheck(primaryEndpoint);
          resolve(wsProviders[chain]);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

async function providerHealthCheck(chain: string) {
  console.log(
    `💗 Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider fro rpc ${chain}.`
  );
  healthCheckInProgress[chain] = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProviders[chain].isConnected) {
    console.log(`All good. Connected back to ${chain}`);
    healthCheckInProgress[chain] = false;
    return true;
  } else {
    console.log(
      `rpc endpoint ${chain} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds. Disconnecting from ${chain} and switching to a backup rpc endpoint`
    );
    await wsProviders[chain].disconnect();

    healthCheckInProgress[chain] = false;
    throw new Error(
      `rpc endpoint ${chain} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds.`
    );
  }
}

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
    console.error("Unable to retrieve finalized head - returned genesis block");
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
      api = await getApiKusamaAssetHub();
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
      api = await getApiKusamaAssetHub();
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
      api = await getApiKusamaAssetHub();
      break;
    default:
      break;
  }
  return (await api.rpc.chain.getBlockHash(blockNumber)).toString();
};
