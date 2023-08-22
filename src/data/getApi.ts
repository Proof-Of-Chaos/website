import { ApiPromise, WsProvider } from "@polkadot/api";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

const MAX_RETRIES = 5;
const WS_DISCONNECT_TIMEOUT_SECONDS = 20;

const CHAIN = {
  KUSAMA: "kusama",
  KUSAMA_ASSET_HUB: "kusamaAssetHub",
  ENCOINTER: "encointer",
};

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

export const WS_ENDPOINTS = {
  [CHAIN.KUSAMA]: [
    "wss://kusama-rpc.polkadot.io",
    "wss://kusama.api.onfinality.io/public-ws",
    "wss://kusama-rpc.dwellir.com",
    "wss://kusama-rpc-tn.dwellir.com",
    "wss://1rpc.io/ksm",
    "wss://rpc.ibp.network/kusama",
    "wss://rpc.dotters.network/kusama",
    "wss://kusama.public.curie.radiumblock.co/ws",
  ],
  [CHAIN.KUSAMA_ASSET_HUB]: [
    "wss://statemine-rpc.dwellir.com",
    "wss://statemine-rpc-tn.dwellir.com",
    "wss://sys.ibp.network/statemine",
    "wss://sys.dotters.network/statemine",
    "wss://rpc-asset-hub-kusama.luckyfriday.io",
    "wss://statemine.api.onfinality.io/public-ws",
    "wss://kusama-asset-hub-rpc.polkadot.io",
    "wss://statemine.public.curie.radiumblock.co/ws",
    "wss://ksm-rpc.stakeworld.io/assethub",
  ],
  [CHAIN.ENCOINTER]: [
    "wss://kusama.api.enointer.org",
    "wss://encointer.api.onfinality.io/public-ws",
    "wss://sys.ibp.network/encointer-kusama",
    "wss://sys.dotters.network/encointer-kusama",
  ],
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const providerHealthCheck = async (chain: string) => {
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] =
    WS_ENDPOINTS[chain];
  console.log(
    `Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider fro rpc ${primaryEndpoint}.`
  );
  healthCheckInProgress[chain] = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProviders[chain].isConnected) {
    console.log(`All good. Connected back to ${primaryEndpoint}`);
    healthCheckInProgress[chain] = false;
    return true;
  } else {
    console.log(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds. Disconnecting from ${primaryEndpoint} and switching to a backup rpc endpoint ${secondaryEndpoint}`
    );
    await wsProviders[chain].disconnect();

    healthCheckInProgress[chain] = false;
    throw new Error(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds.`
    );
  }
};

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 */
const getProvider = async (chain: string) => {
  const [primaryEndpoint, ...otherEndpoints] = WS_ENDPOINTS[chain];
  return await new Promise<WsProvider | undefined>((resolve, reject) => {
    wsProviders[chain] = new WsProvider(primaryEndpoint);
    wsProviders[chain].on("disconnected", async () => {
      console.log(`WS provider for rpc ${primaryEndpoint} disconnected!`);
      if (!healthCheckInProgress[chain]) {
        try {
          await providerHealthCheck(chain);
          resolve(wsProviders[chain]);
        } catch (error: any) {
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
      if (!healthCheckInProgress[chain]) {
        try {
          await providerHealthCheck(chain);
          resolve(wsProviders[chain]);
        } catch (error: any) {
          reject(error);
        }
      }
    });
  });
};

export async function getApiKusama(): Promise<ApiPromise> {
  return getApi(CHAIN.KUSAMA);
}

export async function getApiKusamaAssetHub(): Promise<ApiPromise> {
  return getApi(CHAIN.KUSAMA_ASSET_HUB);
}

export async function getApiEncointer(): Promise<ApiPromise> {
  return getApi(CHAIN.ENCOINTER);
}

/**
 *
 * @param wsEndpoints - array of rpc ws endpoints. In the order of their priority
 * @param retry - retry count
 */
export const getApi = async (chain: string, retry = 0): Promise<ApiPromise> => {
  if (wsProviders[chain] && apis[chain] && apis[chain].isConnected)
    return apis[chain];
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] =
    WS_ENDPOINTS[chain];

  try {
    const provider = await getProvider(chain);
    apis[chain] = await ApiPromise.create({ provider });
    await apis[chain].isReady;
    return apis[chain];
  } catch (error: any) {
    if (retry < MAX_RETRIES) {
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      WS_ENDPOINTS[chain] = [
        secondaryEndpoint,
        ...otherEndpoints,
        primaryEndpoint,
      ];

      console.log("will retry getApi with", chain, WS_ENDPOINTS[chain][0]);

      return await getApi(chain, retry + 1);
    } else {
      return apis[chain];
    }
  }
};

// const api = await getPolkadotApi();
