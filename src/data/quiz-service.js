import { getApi, sendAndFinalize } from './chain';

export async function submitQuizAnswers(signer, ref, address, userAnswers) {
  console.log( 'submitting', userAnswers )
  const api = await getApi()
  let transaction = await getQuizAnswersRemarkTx(api, ref, userAnswers)
  return sendAndFinalize(transaction, signer, address);
}

async function getQuizAnswersRemarkTx(api, ref, userAnswers) {
  return api.tx.system.remark('GOV::' + ref + '::QUIZ::' + JSON.stringify(userAnswers.answers))
}