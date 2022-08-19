import { Dialog } from "@headlessui/react";
import { castVote } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';
import {useEffect, useState} from "react";
import {getWallets} from "@talisman-connect/wallets";
import useAppStore from "../../zustand";

export default function ReferendumVoteModal( { id, title } ) {
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
      value: 'Locked4x',
      label: '3x - locked for 4 enactment periods (32 days)',
    },
    {
      value: 'Locked8x',
      label: '4x - locked for 8 enactment periods (64 days)',
    },
    {
      value: 'Locked1x6',
      label: '5x - locked for 16 enactment periods (128 days)',
    },
    {
      value: 'Locked3x2',
      label: '6x - locked for 32 enactment periods (256 days)',
    },
  ]

  const [ accounts, setAccounts ] = useState([])
  const [ state, setState ] = useState({
    'vote-lock': VOTE_LOCK_OPTIONS[0].value,
  })
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)
  let initialWallet = null;
  let initialVoteAmount = 1;

  useEffect(() => {
    let useWallet = getWallets().find(foundWallet => foundWallet.extensionName === connectedWallet?.source)

    if (useWallet) {
      useWallet.enable('ProofOfChaos').then(() => {
        try {
          useWallet.subscribeAccounts((accounts) => {
            setAccounts(accounts)
            initialWallet = JSON.parse(localStorage.getItem('selectedAccount'))?.address ?? accounts[0].address ?? null
            state["wallet-select"] = initialWallet
            state["vote-amount"] = initialVoteAmount
            setState(state)
          });
        } catch (err) {
          console.log("Wallet connect error: ", err)
        }
      });
    }
  }, [])

  const setFormFieldValue = (e) => {
    let field = e.target.getAttribute('id')
    state[field] = e.target.value
    setState(state)
  }

  async function onClickCastVote(aye = true) {
    const balance = parseFloat(state['vote-amount']) * 1000000000000;
    let useWallet = getWallets().find(foundWallet => foundWallet.extensionName === connectedWallet?.source)

    // TODO: message when no wallet is connected OR connect wallet prompt
    if (useWallet) {
      const signer = useWallet.signer;

      toast.promise(
        castVote(signer, aye, id, state['wallet-select'], balance, state['vote-lock']),
        {
          pending: `sending your vote for referendum ${ id }`,
          success: 'vote successfully recorded 🗳️',
          error: 'error recording vote 🤯'
        }
      ).then( () => { closeModal() } );
    }
  }

  return(
    <>
      <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-gray-900">
        Vote on Referendum { id }
      </Dialog.Title>
      <div className="mt-4">
        { title }
      </div>

      <form className="mt-8">
        <Input
          id="wallet-select"
          label="Select Wallet"
          type="select"
          value={ initialWallet }
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
          value={ initialVoteAmount }
          className="text-base"
          tooltip="The value is locked for the selected time below"
          onChange={setFormFieldValue.bind(this)}
        />
        <Input
          id="vote-lock"
          label="Vote Lock"
          type="select"
          className="text-xs sm:text-sm md:text-base"
          options={ VOTE_LOCK_OPTIONS }
          tooltip="How long your value is locked - increases voting power"
          onChange={setFormFieldValue.bind(this)}
        />
      </form>

      <div className="mt-6">
        <Button
          className="mr-2 bg-gradient-to-r from-green-500/80 to-green-700/80 text-white"
          onClick={ () => onClickCastVote(true) }>
          Aye
        </Button>
        <Button
          className="mr-2 bg-gradient-to-r from-red-500/80 to-red-700/80 text-white text-4xl"
          onClick={ () => onClickCastVote(false) }>
          Nay
        </Button>
        <Button
          variant="calm"
          onClick={closeModal}>
          Cancel
        </Button>
      </div>
    </>
  )
}