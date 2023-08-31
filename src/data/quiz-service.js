import { getApi, getApiKusama, sendAndFinalize } from "./chain";

export async function submitQuizAnswers(
  signer,
  ref,
  address,
  userAnswers,
  quizVersion,
  extrinsicVersion
) {
  return new Promise(async (resolve, reject) => {
    try {
      const api = await getApiKusama();
      let transaction = await getQuizAnswersRemarkTx(
        api,
        ref,
        userAnswers,
        quizVersion,
        extrinsicVersion
      );
      const { success } = await sendAndFinalize(transaction, signer, address);
      resolve(success);
    } catch (error) {
      if (error === "signAndSend cancelled") {
        reject("cancelled");
      } else {
        reject(error);
      }
    }
  });
}

async function getQuizAnswersRemarkTx(
  api,
  ref,
  userAnswers,
  quizVersion,
  extrinsicVersion
) {
  let proofOfChaosPrefixVersion = extrinsicVersion ?? "";
  let answerArray = [];
  let answerObject = {};
  for (const answerOptions in userAnswers.answers) {
    userAnswers.answers[answerOptions].forEach((answer, index) => {
      if (answer) {
        answerArray.push(index);
      }
    });
  }
  answerObject.answers = answerArray;
  answerObject.quizVersion = quizVersion;
  return api.tx.system.remark(
    `PROOFOFCHAOS${proofOfChaosPrefixVersion}::${ref}::ANSWERS::${JSON.stringify(
      answerObject
    )}`
  );
}
