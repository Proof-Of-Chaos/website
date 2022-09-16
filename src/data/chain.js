import { ApiPromise, WsProvider } from '@polkadot/api';

const WS_ENDPOINTS = [
  'wss://kusama-rpc.polkadot.io',
  'wss://kusama.api.onfinality.io/public-ws',
  'wss://kusama-rpc.dwellir.com'
];

const MAX_RETRIES = 15;
const WS_DISCONNECT_TIMEOUT_SECONDS = 20;
const RETRY_DELAY_SECONDS = 20;

let wsProvider;
let polkadotApi;
let healthCheckInProgress = false;

/**
 * @see https://polkadot.js.org/docs/api/cookbook/tx
 * TODO maybe include a batchall call when multiple tx are passed
 * TODO 
 * @param {*} tx 
 * @param {*} signer 
 * @param {*} address 
 * @param {*} resolvedOnFinalizedOnly 
 * @param {*} retry 
 * @returns 
 */
export const sendAndFinalize = async (
  tx,
  signer,
  address,
  resolvedOnFinalizedOnly = true,
  retry = 0,
) => {
  return new Promise(async (resolve, reject) => {
    const api = await getApi();

    const returnObject = { success: false, hash: undefined, included: [], finalized: [], block: 0 }

    try {
      const unsubscribe = await tx.signAndSend(
        address, { signer: signer },
        async ({ events = [], status, dispatchError }) => {
          returnObject.success = !dispatchError;
          returnObject.included = [...events];
          returnObject.hash = status.hash;

          const rejectPromise = (error) => {
            console.error(`Error sending tx`, error);
            console.log(`tx for the error above`, tx.toHuman());
            unsubscribe();
            reject(error);
          }

          if (status.isInBlock) {
            console.log(
              `📀 Transaction ${tx.meta.name} included at blockHash ${status.asInBlock} [success = ${!dispatchError}]`,
            );

            // Get block number that this tx got into, to return back to user
            const signedBlock = await api.rpc.chain.getBlock(status.asInBlock);
            returnObject.block = signedBlock.block.header.number.toNumber();

            // If we don't care about waiting for this tx to get into a finalized block, we can return early.
            if (!resolvedOnFinalizedOnly && !dispatchError) {
              unsubscribe();
              resolve(returnObject);
            }
          } else if (status.isBroadcast) {
            console.log(`🚀 Transaction broadcasted.`);
          } else if (status.isFinalized) {
            console.log(
              `💯 Transaction ${tx.meta.name}(..) Finalized at blockHash ${status.asFinalized}`,
            );

            if ( dispatchError ) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                const { docs } = decoded;
  
                rejectPromise( docs.join(' ') )
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                rejectPromise( dispatchError.toString() )
              }
            } else {
              if (returnObject.block === 0) {
                const signedBlock = await api.rpc.chain.getBlock(status.asFinalized);
                returnObject.block = signedBlock.block.header.number.toNumber();
              }
              resolve(returnObject);
            }
            unsubscribe();
          } else if (status.isReady) {
            // let's not be too noisy..
          } else if (status.isInvalid) {
            rejectPromise(new Error(`Extrinsic isInvalid`))
          } else {
            console.log(`🤷 Other status ${status}`);
          }
        },
      );
    } catch (error) {
      console.log(
        `Error sending tx. Error: "${error.message}". TX: ${JSON.stringify(tx.toHuman())}`,
      );
      if (retry < MAX_RETRIES) {
        console.log(`sendAndFinalize Retry #${retry} of ${MAX_RETRIES}`);
        await sleep(RETRY_DELAY_SECONDS * 1000);
        const result = await sendAndFinalize(tx, account, resolvedOnFinalizedOnly, retry + 1);
        resolve(result);
      } else {
        console.error(`Error initiating tx signAndSend`, error);
        reject(error);
      }
    }
  });
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
  if (wsProvider && polkadotApi && polkadotApi.isConnected) return polkadotApi;
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