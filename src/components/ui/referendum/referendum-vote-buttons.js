import { useLatestUserVoteForRef } from "../../../hooks/use-votes";
import useAppStore from "../../../zustand";
import { useModal } from "../../modals/context";
import WalletConnect from "../../nft/wallet-connect"
import Button from "../button"

export default function ReferendumVoteButtons({referendum}) {
  const { openModal } = useModal();

  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  const { data: latestUserVote } = useLatestUserVoteForRef( referendum.index )
  const hasUserSubmittedQuiz = referendum?.submissions ? referendum?.submissions.some(e => e.wallet === connectedAccount?.ksmAddress) : false

  return (
  <div className="">
    { connectedAccount ?
      <>
        { referendum.quiz?.questions &&
          <Button
            onClick={() => openModal( 'VIEW_REFERENDUM_QUIZ', referendum ) }
            className="w-full"
            variant={ hasUserSubmittedQuiz ? 'calm' : 'primary' }
          >
            { hasUserSubmittedQuiz ? 'Submit Quiz Again' : 'Take Quiz' }
          </Button>
        }
        <Button
          onClick={() => openModal( 'VIEW_REFERENDUM_VOTE', referendum ) }
          className="mt-2 w-full"
          variant={ latestUserVote ? 'calm' : 'primary' }
        >
          { latestUserVote ? 'Vote Again' : 'Vote Now' }
        </Button>
      </>
    :
    <>
    {referendum.quiz?.questions && <WalletConnect
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