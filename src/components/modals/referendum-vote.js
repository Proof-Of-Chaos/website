import { Dialog } from "@headlessui/react";
import { castVote } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { getWalletBySource} from "@talismn/connect-wallets";
import useAppStore from "../../zustand";
import useAccountBalance from "../../hooks/use-account-balance";
import { microToKSM } from '../../utils'
import { isNumber } from "lodash";
import { InlineLoader } from "../ui/loader";
import { useQueryClient } from "@tanstack/react-query";
import { useLatestUserVoteForRef } from "../../hooks/use-votes";
import { useVoteManager } from "../../hooks/use-vote-manager";
import { useForm } from "react-hook-form";
import { ReferendumVoteForm } from "../ui/referendum/referendum-vote-form";

export default function ReferendumVoteModal( { index, title, userAnswers, gov2 = false} ) {
  const { data: latestUserVote } = useLatestUserVoteForRef( index )
  const { data: accountBalance, isLoading: isBalanceLoading } = useAccountBalance()
  const availableBalance = microToKSM( accountBalance?.data?.free )
  const { closeModal } = useModal();
  const queryClient = useQueryClient()

  const VOTE_LOCK_OPTIONS = [
    {
      value: 'None',
      label: '0.1x - no lockup',
    },
    {
      value: 'Locked1x',
      label: '1x - locked for 1 enactment period (8 days)',
    },
    {
      value: 'Locked2x',
      label: '2x - locked for 2 enactment periods (16 days)',
    },
    {
      value: 'Locked3x',
      label: '3x - locked for 4 enactment periods (32 days)',
    },
    {
      value: 'Locked4x',
      label: '4x - locked for 8 enactment periods (64 days)',
    },
    {
      value: 'Locked5x',
      label: '5x - locked for 16 enactment periods (128 days)',
    },
    {
      value: 'Locked6x',
      label: '6x - locked for 32 enactment periods (256 days)',
    },
  ]

  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])
  const hasUserSubmittedAnswers = useAppStore((state) => state.user.quizAnswers?.[index]?.submitted )

  const { voteOnRef } = useVoteManager();

  const { register, handleSubmit } = useForm();
  const onSubmit = data => console.log(data);

  const [ state, setState ] = useState({
    'wallet-select': connectedAccount?.address,
    'vote-amount': '',
    'vote-lock': '',
    'availableBalance': '',
    userAnswers,
  })

  useEffect( () => {
    setState( {
      ...state,
      'vote-amount': microToKSM(latestUserVote?.balance?.value),
      'vote-lock': latestUserVote ? `Locked${latestUserVote?.lockPeriod}x` : 'None',
    })
  }, [ latestUserVote ])

  const setFormFieldValue = (e) => {
    setState({
      ...state,
      [e.target.getAttribute('id')]: e.target.value,
    })
  }

  async function onClickCastVote(aye = true) {
    voteOnRef(index,aye,3,'none')
    closeModal()
  }

  const convictionString = latestUserVote?.lockPeriod
  const latestVoteBalance = microToKSM(latestUserVote?.balance?.value)
  const voteAmountLabel = isBalanceLoading ? <>{`Value (available: ` } <InlineLoader /> {`)`} </> : `Value (available: ${ availableBalance?.toFixed( 2 ) } KSM)`

  return(
    <>
      <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-gray-900 pb-2">
        Vote on Referendum { index }
      </Dialog.Title>
      <div className="pr-4 overflow-y-scroll flex-1">
        <div className="mt-4">
          { title }
        </div>
        {
          hasUserSubmittedAnswers &&
          <div className="bg-emerald-600 text-white p-3 mt-4 rounded-lg text-sm">
          Thanks for answering those questions, your answers were successfully recorded. If you answered correctly, you will have a higher chance of receiving rare and epic Items for this Referendum.
          </div>
        }
        { latestUserVote &&
            <div className="bg-amber-300 p-3 rounded-lg text-sm mt-4">
              You already voted <b>{ latestUserVote.decision === 'yes' ? 'Aye' : 'Nay' }</b> on this referendum with <b>{ latestVoteBalance } KSM</b> and <b>{ convictionString }x</b> conviction. <br /> Voting again will replace your current vote.
            </div>
          }
        <ReferendumVoteForm referendumId={ index } />
      </div>
    </>
  )
}