import { useLatestQuizForRef } from "../../../hooks/use-quizzes";
import { useLatestUserVoteForRef, useuVoteForRef } from "../../../hooks/use-votes";
import useAppStore from "../../../zustand";
import { useModal } from "../../modals/context";
import WalletConnect from "../../nft/wallet-connect"
import Button from "../button"

export default function ReferendumVoteButtons({referendum, userVote}) {
  const { openModal } = useModal();

  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  const { data: latestUserVote } = useLatestUserVoteForRef( referendum.index )
  const { data: latestQuiz, isQuizLoading } = useLatestQuizForRef( referendum.index, referendum.gov2 );

  const hasUserSubmittedQuiz = latestQuiz?.submissions ? latestQuiz?.submissions.some(e => e.wallet === connectedAccount?.ksmAddress) : false
  const uVote = latestUserVote || userVote

  return (
  <div className="">
    { connectedAccount && ! isQuizLoading ?
      <>
        { latestQuiz?.questions &&
          <Button
            onClick={() => openModal( 'VIEW_REFERENDUM_QUIZ', {
              referendum,
              quiz: latestQuiz,
            } ) }
            className="w-full mb-2"
            variant={ hasUserSubmittedQuiz ? 'calm' : 'primary' }
          >
            { hasUserSubmittedQuiz ? 'Submit Quiz Again' : 'Take Quiz' }
          </Button>
        }
        <Button
          onClick={() => openModal( 'VIEW_REFERENDUM_VOTE', referendum ) }
          className="w-full"
          variant={ uVote ? 'calm' : 'primary' }
        >
          { uVote ? 'Vote Again' : 'Vote Now' }
        </Button>
      </>
    :
    <>
    {latestQuiz?.questions && <WalletConnect
        className="w-full mt-4"
        variant="primary"
        title="Take Quiz"
        onAccountSelected={ ( ) => {
          openModal( 'VIEW_REFERENDUM_QUIZ', referendum )
        } }
      />
    }
    <WalletConnect
      className="w-full mt-2"
      variant="primary"
      title={ 'Vote Now' }
      onAccountSelected={ ( ) => {
        openModal( 'VIEW_REFERENDUM_VOTE', referendum )
      } }
    />
  </>
  }
  </div>
  )
}