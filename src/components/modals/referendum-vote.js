import { Dialog } from "@headlessui/react";
import { setTimeoutPromise } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';
import {useEffect, useState} from "react";
import {getWallets} from "@talisman-connect/wallets";

export default function ReferendumVoteModal( { id, title } ) {
  const { closeModal } = useModal();
  const [ accounts, setAccounts ] = useState([])

  const VOTE_LOCK_OPTIONS = [
    {
      value: '0.1',
      label: '0.1x - no lockup',
    },
    {
      value: '1',
      label: '1x - locked for 1 enactment period (8 days)',
    },
    {
      value: '2',
      label: '2x - locked for 2 enactment periods (16 days)',
    },
    {
      value: '4',
      label: '3x - locked for 4 enactment periods (32 days)',
    },
    {
      value: '8',
      label: '4x - locked for 8 enactment periods (64 days)',
    },
    {
      value: '16',
      label: '5x - locked for 16 enactment periods (128 days)',
    },
    {
      value: '32',
      label: '6x - locked for 32 enactment periods (256 days)',
    },
  ]

  useEffect(() => {
    let connectedWallet = localStorage.getItem('connectedWallet')
    let useWallet = getWallets().find(foundWallet => foundWallet.extensionName === connectedWallet)

    if (useWallet) {
      useWallet.enable('ProofOfChaos').then(() => {
        try {
          useWallet.subscribeAccounts((accounts) => {
            setAccounts(accounts)
          });
        } catch (err) {
          console.log("Wallet connect error: ", err)
        }
      });
    }
  }, [])

  async function onClickAye() {
    toast.promise(
      setTimeoutPromise(3000),
      {
        pending: `sending your vote for referendum ${ id }`,
        success: 'vote successfully recorded 🗳️',
        error: 'error recording vote 🤯'
      }
    ).then( () => { closeModal() } );
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
          value={ JSON.parse(localStorage.getItem('selectedAccount'))?.address }
          options={ accounts.map( (account) => {
            return {
              label: account.name,
              value: account.address,
            };
          })}
          tooltip="Select the wallet for voting"
        />
        <Input
          id="vote-amount"
          label="Value"
          type="number"
          className="text-base"
          tooltip="The value is locked for the selected time below"
        />
        <Input
          id="vote-lock"
          label="Vote Lock"
          type="select"
          className="text-xs sm:text-sm md:text-base"
          options={ VOTE_LOCK_OPTIONS }
          tooltip="How long your value is locked - increases voting power"
        />
      </form>

      <div className="mt-6">
        <Button
          className="mr-2 bg-gradient-to-r from-green-500/80 to-green-700/80 text-white"
          onClick={ () => onClickAye() }>
          Aye
        </Button>
        <Button
          className="mr-2 bg-gradient-to-r from-red-500/80 to-red-700/80 text-white text-4xl"
          onClick={closeModal}>
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