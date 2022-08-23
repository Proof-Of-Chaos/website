import { Dialog } from "@headlessui/react";
import { castVote } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';
import {useEffect, useState} from "react";
import {getWalletBySource, getWallets} from "@talisman-connect/wallets";
import useAppStore from "../../zustand";
import { web3FromSource } from "@talisman-connect/components";
import { useAccountVote } from "../../lib/hooks/use-referendums";

export default function ReferendumVoteModal( { id, title, userAnswers } ) {
  const { data:userVote } = useAccountVote( id );
  const { closeModal } = useModal();
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

  const connectedAccount = useAppStore((state) => state.user.connectedAccount)
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)
  const hasUserSubmittedAnswers = useAppStore((state) => state.user.quizAnswers?.[id]?.submitted )
  
  const { address } = connectedAccount
  const { accounts } = connectedWallet

  const [ state, setState ] = useState({
    'wallet-select': connectedAccount?.address,
    'vote-amount': '',
    'vote-lock': '',
    userAnswers: userAnswers,
  })

  const setFormFieldValue = (e) => {
    setState({
      ...state,
      [e.target.getAttribute('id')]: e.target.value,
    })
  }

  async function onClickCastVote(aye = true) {
    const balance = parseFloat(state['vote-amount']) * 1000000000000
    const wallet = getWalletBySource(connectedAccount.source)
    await wallet.enable('Proof of Chaos')
    
    try {
      toast.promise(
        castVote(wallet.signer, aye, id, state['wallet-select'], balance, state['vote-lock'], state['userAnswers']).then( () => { closeModal() } ),
        {
          pending: `sending your vote for referendum ${ id }`,
          success: 'Vote successfully recorded 🗳️',
          error: 'Error recording vote 🤯'
        }
      )
    } catch (err) {
      console.log( '>>> err', err );
    }
  }

  return(
    <>
      <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-gray-900 pb-2">
        Vote on Referendum { id }
      </Dialog.Title>
      <div className="pr-4 overflow-y-scroll flex-1">
        <div className="mt-4">
          { title }
        </div>
        {
          hasUserSubmittedAnswers &&
          <div className="bg-emerald-600 text-white p-3 mt-4 rounded-lg text-sm">
            Cool, you submitted answers for the quiz of this referendum and will gain a luck boost of ~50%
          </div>
        }
        { userVote &&
            <div className="bg-amber-300 p-3 rounded-lg text-sm mt-4">
              You already voted <b>{ userVote.aye ? 'Aye' : 'Nay' }</b> on this referendum with <b>{ userVote.balance } KSM</b> and <b>{ userVote.conviction?.substring(6) }</b> conviction. <br /> Voting again will replace your current vote.
            </div>
          }
        <form className="mt-4">
          <Input
            id="wallet-select"
            label="Select Wallet"
            type="select"
            value={ state["wallet-select"] }
            options={ accounts.map( (account) => {
              return {
                label: account.name,
                value: account.address,
              };
            })}
            tooltip="Select the wallet for voting"
            onChange={setFormFieldValue.bind(this)}
          />
          <Input
            id="vote-amount"
            label="Value"
            type="number"
            step="0.1"
            min="0"
            value={ state["vote-amount"] }
            className="text-base"
            placeholder={ userVote?.balance ?? '' }
            tooltip="The value is locked for the selected time below"
            onChange={setFormFieldValue.bind(this)}
          />
          <Input
            id="vote-lock"
            label="Vote Lock"
            type="select"
            className="text-xs sm:text-sm md:text-base"
            options={ VOTE_LOCK_OPTIONS }
            value={ userVote?.conviction ?? '' }
            tooltip="How long your value is locked - increases voting power"
            onChange={setFormFieldValue.bind(this)}
          />
        </form>
        <div className="mt-6">
          <Button
            className="mr-2 bg-gradient-to-r from-green-500/80 to-green-700/80 text-white"
            onClick={ async () => onClickCastVote(true) }>
            Aye
          </Button>
          <Button
            className="mr-2 bg-gradient-to-r from-red-500/80 to-red-700/80 text-white text-4xl"
            onClick={ async () => onClickCastVote(false) }>
            Nay
          </Button>
          <Button
            variant="calm"
            onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  )
}