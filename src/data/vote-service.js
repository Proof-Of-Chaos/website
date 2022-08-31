import { ApiPromise, WsProvider } from '@polkadot/api';

export async function castVote(signer, aye, ref, address, balance, conviction, userAnswers, onSuccess) {
  return new Promise( async ( resolve, reject ) => {
    const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider })

    try {
      let txs = [getVoteTx(api, aye, ref, balance, conviction)];

      if (userAnswers) {
        txs.push(getQuizRemarkTx(api, ref, userAnswers));
      }

      const unsub = await api.tx.utility
        .batchAll(txs)
        .signAndSend(
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

              reject( docs.join(' ') )
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              reject( dispatchError.toString() )
            }
          } else {
            //store the user quiz answers locally
            onSuccess()
            resolve( 'Vote recorded' )
          }
          unsub()
        }
      })
    } catch (err) {
      reject( 'voting cancelled' )
    }
  })
}

function getVoteTx(api, aye, ref, balance, conviction) {
  let vote = {
    Standard: {
      vote: {
        aye: aye,
        conviction: conviction,
      },
      balance: balance
    }
  };

  return api.tx.democracy.vote(ref, vote)
}

function getQuizRemarkTx(api, ref, userAnswers) {
  return api.tx.system.remark('GOV::' + ref + '::QUIZ::' + JSON.stringify(userAnswers.answers))
}