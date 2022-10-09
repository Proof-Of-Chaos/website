import { getApi, sendAndFinalize } from './chain';

export async function submitQuizAnswers(signer, ref, address, userAnswers, quizVersion) {
  return new Promise( async (resolve, reject ) => {
    try {
      const api = await getApi()
      let transaction = await getQuizAnswersRemarkTx(api, ref, userAnswers, quizVersion)
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

async function getQuizAnswersRemarkTx(api, ref, userAnswers, quizVersion) {
  let answerArray = []
  let answerObject = {}
  for (const answerOptions in userAnswers.answers) {
    userAnswers.answers[answerOptions].forEach((answer, index) => {
      if (answer) {
        answerArray.push(index)
      }
    })
  }
  answerObject.answers = answerArray
  answerObject.quizVersion = quizVersion
  return api.tx.system.remark('PROOFOFCHAOS::' + ref + '::ANSWERS::' + JSON.stringify(answerObject))
}