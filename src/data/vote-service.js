import { quizzes } from "./vote-quiz";
import { ApiPromise, WsProvider } from '@polkadot/api';
import useAppStore from "../zustand";

export async function voteOnReferendum( refId, amount, lockup ) {
  return Promise.resolve('fake data')
}

export async function getQuizzes() {
  await setTimeoutPromise(2000)
  return quizzes
}

export async function getQuizById( referendumId ) {
  await setTimeoutPromise(2000)
  return quizzes[ referendumId ]
}

export async function setTimeoutPromise(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

export async function castVote(signer, aye, ref, address, balance, conviction) {
  return new Promise( async ( resolve, reject ) => {
    const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider })

    let vote = {
      Standard: {
        vote: {
          aye: aye,
          conviction: conviction,
        },
        balance: balance
      }
    };

    try {
      await api.tx.democracy.vote(ref, vote).signAndSend(address, {signer: signer}, result => {
        if (result.status.isInBlock) {
          resolve( 'in block' )
        } else if (result.status.isFinalized) {
          resolve( 'finalized' )
        }
      })
    } catch (err) {
      reject( 'voting cancelled' )
    }
  })
}

export async function getQuizAnswers() {
  return getFromStorage( 'quiz' );
}

export async function storeQuizAnswers( answers ) {
  return persistToStorage( 'quiz', answers )
}

//helper for demo - mock data storage with localstorage

async function persistToStorage( key, data ){
  await setTimeoutPromise(500)
  localStorage.setItem( key, JSON.stringify(data) )
  console.log( 'persisting', data, 'to', key );
  return Promise.resolve( data )
}

async function getFromStorage( key ) {
  await setTimeoutPromise(500)
  return Promise.resolve(JSON.parse(localStorage.getItem( key )))
}