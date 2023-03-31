import { getApi, sendAndFinalize } from './chain';
import { VoteChoice } from '../hooks/use-vote-manager';

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

export function getVoteTx(api, voteChoice, ref, balances, conviction, gov2 = false) {

  let vote = {}

  switch (voteChoice) {
    case VoteChoice.Aye:
    case VoteChoice.Nay:
      vote = {
        Standard: {
          vote: {
            aye: voteChoice === VoteChoice.Aye,
            conviction: conviction,
          },
          balance: VoteChoice === VoteChoice.Aye ? balances.aye : balances.nay,
        }
      }
      break
    case VoteChoice.Split:
      vote = {
        Split: {
          aye: balances.aye,
          nay: balances.nay
        }
      }
      break
    case VoteChoice.Abstain:
      vote = {
        SplitAbstain: {
          aye: balances.aye, 
          nay: balances.nay,
          abstain: balances.abstain
        }
      }
  }
  

  // let vote = {
  //   Standard: {
  //     vote: {
  //       aye: aye,
  //       conviction: conviction,
  //     },
  //     balance: balance
  //   }
  // };

  console.log( 'votetx', vote )

  if ( gov2 ) {
    return api.tx.convictionVoting.vote(ref,vote)
  }
  return api.tx.democracy.vote(ref, vote)
}