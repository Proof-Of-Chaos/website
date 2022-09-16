import { getApi, sendAndFinalize } from './chain';

export async function castVote(signer, aye, ref, address, balance, conviction) {
  return new Promise( async (resolve, reject ) => {
    try {
      const api = await getApi()
      let transaction = await getVoteTx(api, aye, ref, balance, conviction);
      const { success } = await sendAndFinalize(transaction, signer, address);
      resolve( success );
    } catch( error ) {
      //TODO here should be some error specification
      reject( 'something went wrong' )
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