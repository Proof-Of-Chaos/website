import { quizzes } from "./vote-quiz";


export async function voteOnReferendum( refId, amount, lockup ) {
  return Promise.resolve('fake data')
}

export async function getQuizById( referendumId ) {
  await setTimeoutPromise(2000);
  return quizzes[ referendumId ];
}

export async function setTimeoutPromise(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};