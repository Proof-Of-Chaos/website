import { getApi, sendAndFinalize } from './chain';

export async function submitQuizAnswers(signer, ref, address, userAnswers) {
  return new Promise( async (resolve, reject ) => {
    try {
      const api = await getApi()
      let transaction = await getQuizAnswersRemarkTx(api, ref, userAnswers)
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

async function getQuizAnswersRemarkTx(api, ref, userAnswers) {
  return api.tx.system.remark('GOV::' + ref + '::QUIZ::' + JSON.stringify(userAnswers.answers))
}