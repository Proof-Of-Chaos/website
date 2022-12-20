import '@polkadot/rpc-augment'
import { ApiPromise, WsProvider } from '@polkadot/api';

const WS_ENDPOINTS = [
  'wss://kusama-rpc.polkadot.io',
  'wss://kusama.api.onfinality.io/public-ws',
  'wss://kusama-rpc.dwellir.com'
];

const MAX_RETRIES = 15;
const WS_DISCONNECT_TIMEOUT_SECONDS = 20;

let wsProvider;
let polkadotApi;
let healthCheckInProgress = false;

/**
 * @see https://polkadot.js.org/docs/api/cookbook/tx
 * TODO maybe include a batchall call when multiple tx are passed
 * @param {*} tx 
 * @param {*} signer 
 * @param {*} address
 * @returns 
 */

export const sendAndFinalize = async (
  tx,
  signer,
  address
) => {
  return new Promise(async (resolve, reject) => {
    const api = await getApi();
    try {
      const unsub = await tx.signAndSend(
          address, { signer: signer }, ({ status, dispatchError }) => {
            if (status.isInBlock) {
              // console.log( 'transaction in block waiting for finalization' )
            } else if (status.isFinalized) {
              // console.log(`Transaction included at blockHash ${status.asFinalized}`);
              // console.log(`Transaction hash ${txHash.toHex()}`);

              // Loop through Vec<EventRecord> to display all events
              if (dispatchError) {
                if (dispatchError.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  const { docs, name, section } = decoded;

                  reject(docs.join(' '))
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  reject(dispatchError.toString())
                }
              } else {
                //store the user quiz answers locally
                // onSuccess()
                resolve(`success signAndSend ${ tx.name }` )
              }
              unsub()
            }
          })
    } catch (err) {
      reject('signAndSend cancelled')
    }
  })
};

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

export async function getApi(
  wsEndpoints = WS_ENDPOINTS,
  retry = 0,
) {
  if (wsProvider && polkadotApi) return polkadotApi;
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;

  try {
    const provider = await getProvider(wsEndpoints);
    polkadotApi = await ApiPromise.create({ provider });
    await polkadotApi.isReady;
    return polkadotApi;
  } catch (error) {
    if (retry < MAX_RETRIES) {
      // If we have reached maximum number of retries on the primaryEndpoint, let's move it to the end of array and try the secondary endpoint
      return await getApi([secondaryEndpoint, ...otherEndpoints, primaryEndpoint], retry + 1);
    } else {
      return polkadotApi;
    }
  }
};

async function getProvider(wsEndpoints) {
  const [primaryEndpoint, ...otherEndpoints] = wsEndpoints;
  if (wsProvider) return wsProvider;
  return await new Promise((resolve, reject) => {
    wsProvider = new WsProvider(primaryEndpoint);
    wsProvider.on('disconnected', async () => {
      console.log(`WS provider for rpc ${primaryEndpoint} disconnected!`);
      if (!healthCheckInProgress) {
        try {
          await providerHealthCheck(wsEndpoints);
          resolve(wsProvider);
        } catch (error) {
          reject(error);
        }
      }
    });
    wsProvider.on('connected', () => {
      console.log(`WS provider for rpc ${primaryEndpoint} connected`);
      resolve(wsProvider);
    });
    wsProvider.on('error', async () => {
      console.log(`Error thrown for rpc ${primaryEndpoint}`);
      if (!healthCheckInProgress) {
        try {
          await providerHealthCheck(wsEndpoints);
          resolve(wsProvider);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

async function providerHealthCheck(wsEndpoints) {
  const [primaryEndpoint, secondaryEndpoint, ...otherEndpoints] = wsEndpoints;
  console.log(
    `Performing ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds health check for WS Provider fro rpc ${primaryEndpoint}.`,
  );
  healthCheckInProgress = true;
  await sleep(WS_DISCONNECT_TIMEOUT_SECONDS * 1000);
  if (wsProvider.isConnected) {
    console.log(`All good. Connected back to ${primaryEndpoint}`);
    healthCheckInProgress = false;
    return true;
  } else {
    console.log(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds. Disconnecting from ${primaryEndpoint} and switching to a backup rpc endpoint ${secondaryEndpoint}`,
    );
    await wsProvider.disconnect();

    healthCheckInProgress = false;
    throw new Error(
      `rpc endpoint ${primaryEndpoint} still disconnected after ${WS_DISCONNECT_TIMEOUT_SECONDS} seconds.`,
    );
  }
};