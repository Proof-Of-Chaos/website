import "@polkadot/rpc-augment";
import "@polkadot/api-augment/kusama";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { Block } from "@polkadot/types/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import {
  SendAndFinalizeResult,
  ToastType,
} from "../pages/api/nft_sendout_script/types";
import { toast as hotToast, Toast, ToastOptions } from "react-hot-toast";
import { ISubmittableResult } from "@polkadot/types/types";

const CHAIN = {
  KUSAMA: "kusama",
  KUSAMA_ASSET_HUB: "kusamaAssetHub",
  ENCOINTER: "encointer",
};

export const WS_ENDPOINTS = {
  [CHAIN.KUSAMA]: [
    "wss://kusama-rpc.dwellir.com",
    "wss://kusama-rpc.polkadot.io",
    "wss://kusama.api.onfinality.io/public-ws",
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

const MAX_RETRIES = 10;
const WS_DISCONNECT_TIMEOUT_SECONDS = 10;

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

export const defaultToastMessages = [
  `(1/3) Awaiting your signature`,
  `(2/3) Waiting for transaction to enter block`,
  `(3/3) Waiting for block finalization`,
  `Transaction successful`,
];

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
  address,
  toast: ToastType = {
    title: "Processing Transaction",
    messages: defaultToastMessages,
  }
): Promise<SendAndFinalizeResult> => {
  let toastId;
  if (toast) {
    toastId = hotToast.loading(toast.messages[0], {
      // @ts-ignore
      title: toast.title,
      className: "toaster",
    });
  }

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
    const unsub = await call
      .signAndSend(address, { signer: signer }, (result) => {
        const { status, dispatchError, events = [], txHash } = result;
        if (status.isReady) {
          if (toastId) {
            hotToast.loading(toast.messages[1], {
              id: toastId,
            });
          }
        } else if (status.isInBlock) {
          if (toastId) {
            hotToast.loading(toast.messages[2], {
              id: toastId,
            });
          } else {
            // console.log("transaction in block waiting for finalization")
          }
        } else if (status.isFinalized) {
          if (toastId) {
            hotToast.success(toast.messages[3], {
              id: toastId,
              duration: 4000,
            });
          } else {
            console.log(
              `Transaction included at blockHash ${status.asFinalized}`
            );
          }
          // events.forEach(({ phase, event: { data, method, section } }) => {
          //   // console.log(`\t' ${phase}: ${section}.${method}:: ${data}`)
          // });

          if (dispatchError) {
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;

              // console.log("here we are")

              reject(docs.join(" "));
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              reject({ status: "error", message: dispatchError.toString() });
            }
          } else {
            // console.log("here we are 2")
            resolve({
              status: "success",
              message: `success signAndSend ${tx.toString()}`,
              events,
              txHash,
            });
          }
          unsub();
        }
      })
      .catch((error) => {
        // console.log("error", toastId, error)
        if (toastId) {
          hotToast.dismiss(toastId);
        } else {
          console.error(error);
        }

        reject({ status: "cancel", message: "signAndSend cancelled" });
      });
  });
};

export const sendAndFinalizeKeyPair = async (
  api,
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
  account: KeyringPair
): Promise<{
  block: number;
  success: boolean;
  hash: string;
  included: any[];
  finalized: any[];
}> => {
  return new Promise(async (resolve) => {
    let success = false;
    let included = [];
    let finalized = [];
    let block = 0;
    const unsubscribe = await tx.signAndSend(
      account,
      async ({ events = [], status, dispatchError }) => {
        if (status.isInBlock) {
          // console.log(`status: ${status}`)

          success = dispatchError ? false : true;
          console.log(
            `📀 Transaction ${tx.meta.name} included at blockHash ${status.asInBlock} [success = ${success}]`
          );
          const signedBlock = await api.rpc.chain.getBlock(status.asInBlock);
          block = signedBlock.block.header.number.toNumber();
          included = [...events];
        } else if (status.isBroadcast) {
          // console.log(`🚀 Transaction broadcasted.`)
        } else if (status.isFinalized) {
          console.log(
            `💯 Transaction ${tx.meta.name}(..) Finalized at blockHash ${status.asFinalized}`
          );
          finalized = [...events];
          const hash = tx.hash.toHex();
          unsubscribe();
          resolve({ success, hash, included, finalized, block });
        } else if (status.isReady) {
          // let's not be too noisy..
        } else {
          // console.log(`🤷 Other status ${status}`)
        }
      }
    );
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

  if (chainProvider && chainApi && chainApi.isConnected) {
    console.log(
      "returning api from cache for chain",
      chain,
      " because it is connected"
    );
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
    // console.log("error in getApi -> getProvider", error)
    if (retry < MAX_RETRIES) {
      // console.log("⎋ rotating endpoints")

      // console.log("before", WS_ENDPOINTS[chain])
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      WS_ENDPOINTS[chain] = [
        secondaryEndpoint,
        ...otherEndpoints,
        primaryEndpoint,
      ];

      // console.log("after", WS_ENDPOINTS[chain])
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
    wsProviders[chain] = new WsProvider(primaryEndpoint, 1000);
    wsProviders[chain].on("disconnected", async () => {
      // console.log(`⛓️  WS provider for rpc ${primaryEndpoint} disconnected!`)
      if (!healthCheckInProgress[chain]) {
        try {
          await providerHealthCheck(chain);
          resolve(wsProviders[chain]);
        } catch (error) {
          reject(error);
        }
      }
    });
    wsProviders[chain].on("connected", () => {
      // console.log(`WS provider for rpc ${primaryEndpoint} connected`)
      resolve(wsProviders[chain]);
    });
    wsProviders[chain].on("error", async () => {
      // console.log(`Error thrown for rpc ${primaryEndpoint}`)
      if (!healthCheckInProgress[chain]) {
        try {
          await providerHealthCheck(chain);
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
    `💗 Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider for rpc ${chain}.`
  );
  healthCheckInProgress[chain] = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProviders[chain].isConnected) {
    // console.log(`All good. Connected back to ${chain}`)
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

export const getNetworkPrefix = async (network: string) => {
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
  const { ss58Format } = await api.rpc.system.properties();
  return Number(ss58Format);
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

export async function getNFTCollectionDeposit(api: ApiPromise) {
  const deposit = await api.consts.nfts?.collectionDeposit.toString();
  return deposit;
}

export async function getNFTItemDeposit(api: ApiPromise) {
  const deposit = await api.consts.nfts?.itemDeposit.toString();
  return deposit;
}
