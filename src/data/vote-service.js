export async function voteOnReferendum( refId, amount, lockup ) {
  Promise.resolve('fake data')
}

export async function setTimeoutPromise(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};