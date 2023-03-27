import { getApi, sendAndFinalize } from './chain';

export async function castVote(signer, aye, ref, address, balance, conviction, gov2 = false) {
  return new Promise( async (resolve, reject ) => {
    try {
      const api = await getApi()
      let transaction = await getVoteTx(api, aye, ref, balance, conviction, gov2);
      const { success } = await sendAndFinalize(transaction, signer, address);
      resolve( success );
    } catch( error ) {
      if ( error === 'signAndSend cancelled') {
        reject( 'cancelled' );
      } else {
        reject( error )
      }
    }
  })
}

export function getVoteTx(api, aye, ref, balance, conviction, gov2 = false) {
  let vote = {
    Standard: {
      vote: {
        aye: aye,
        conviction: conviction,
      },
      balance: balance
    }
  };

  if ( gov2 ) {
    return api.tx.convictionVoting.vote(ref,vote)
  }
  return api.tx.democracy.vote(ref, vote)
}