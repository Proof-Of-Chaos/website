import { Dialog } from "@headlessui/react";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from "react-toastify";
import useAppStore from "../../zustand";
import { submitQuizAnswers } from "../../data/quiz-service";
import { getWalletBySource } from "@talismn/connect-wallets";

export default function ReferendumQuizModal({
  referendum: { title, index, gov2 },
  quiz,
}) {
  const { openModal, closeModal } = useModal();

  const submitQuiz = useAppStore((state) => state.submitQuiz);
  const updateQuizAnswers = useAppStore((state) => state.updateQuizAnswers);
  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const connectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );
  const walletAddress = connectedAccount?.address;
  const userAnswers = useAppStore((state) => state.user.quizAnswers[index]);

  const isFormFilled =
    userAnswers?.answers &&
    Object.keys(userAnswers.answers).length === quiz?.questions.length;

  async function onSend() {
    if (!isFormFilled) {
      return;
    }

    const wallet = getWalletBySource(connectedAccount.source);
    await wallet?.enable("Proof of Chaos");
    toast
      .promise(
        submitQuizAnswers(
          wallet.signer,
          index,
          walletAddress,
          userAnswers,
          quiz.version,
          gov2 ? "2" : ""
        ),
        {
          pending: `sending your quiz answers for referendum ${index}`,
          success: "answers successfully recorded 🗳️",
          error: "error recording answers 🤯",
        }
      )
      .then(() => {
        //store quiz answers in app state
        submitQuiz(index);
        closeModal();
        openModal("VIEW_REFERENDUM_VOTE", { index, title, userAnswers });
      });
  }

  function onChangeInputs(e, questionIndex, multiple) {
    let qAnswer = null;
    const checkboxes = document.querySelectorAll(
      `[name=ref${index}question${questionIndex}]`
    );
    qAnswer = [...checkboxes].reduce((prev, cur, idx) => {
      return [...prev, cur.checked];
    }, []);

    const newUserAnswers = {
      [`${questionIndex}`]: qAnswer,
    };
    updateQuizAnswers(index, newUserAnswers);
  }

  return (
    <>
      <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
        Quiz for Referendum {index}
      </Dialog.Title>
      <div className="mt-1 text-sm">{title}</div>
      {!quiz?.questions ? (
        <div className="min-h-[200px] flex justify-center items-center">
          Loading...
        </div>
      ) : (
        <>
          <form className="mt-4 pr-4 overflow-y-scroll flex-1">
            {quiz?.questions.map(({ text, answerOptions }, i) => {
              // multiple = multiple === "true" || multiple === true
              const selectOptions = answerOptions.map((a, j) => {
                return {
                  value: j,
                  label: a.text,
                  // bind the checked value of the inputs to state values
                  checked:
                    userAnswers?.answers?.[i] && userAnswers?.answers?.[i][j],
                };
              });

              return (
                <fieldset
                  key={`quiz-${i}`}
                  className="px-4 pt-2 pb-3 font-semibold border-2 border-gray-400 hover:border-gray-500 hover:shadow-lg transition rounded-md my-6"
                >
                  <legend className="px-3">{text}</legend>
                  <Input
                    type={"radio"}
                    id={`r${index}q${i}`}
                    name={`ref${index}question${i}`}
                    options={selectOptions}
                    onChange={(e) => onChangeInputs(e, i)}
                  />
                </fieldset>
              );
            })}
          </form>

          <div className="mt-4">
            <Button
              className="mr-2"
              variant={isFormFilled ? "primary" : "disabled"}
              disabled={!isFormFilled}
              onClick={onSend}
            >
              Submit
            </Button>
            <Button variant="calm" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </>
  );
}
