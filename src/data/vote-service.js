import { getApi, sendAndFinalize } from './chain';

export async function castVote(signer, aye, ref, address, balance, conviction) {
  const api = await getApi()
  let transaction = await getVoteTx(api, aye, ref, balance, conviction);
  return sendAndFinalize(transaction, signer, address);
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