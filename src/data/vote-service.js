import { quizzes } from "./vote-quiz";


export async function voteOnReferendum( refId, amount, lockup ) {
  return Promise.resolve('fake data')
}

export async function getQuizById( referendumId ) {
  await setTimeoutPromise(2000)
  return quizzes[ referendumId ]
}

export async function setTimeoutPromise(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
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