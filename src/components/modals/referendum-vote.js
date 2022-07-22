import { Dialog } from "@headlessui/react";
import { setTimeoutPromise } from "../../data/vote-service";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';

export default function ReferendumVoteModal( { id, title } ) {
  const { closeModal } = useModal();

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
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
        Vote on Referendum { id }
      </Dialog.Title>
      <div className="mt-2">
        { title }
      </div>

      <form className="mt-5">
        <Input
          id="wallet-select"
          label="Select Wallet"
          type="select"
          tooltip="Select the wallet for voting"
        />
        <Input
          id="vote-amount"
          label="Value"
          type="number"
          tooltip="The value is locked for the selected time below"
        />
        <Input
          id="vote-lock"
          label="Vote Lock"
          type="select"
          className="text-xs"
          options={ VOTE_LOCK_OPTIONS }
          tooltip="How long your value is locked - increases voting power"
        />
      </form>

      <div className="mt-6">
        <Button
          className="mr-2 bg-green-500 hover:bg-green-600"
          onClick={ () => onClickAye() }>
          Aye
        </Button>
        <Button
          className="mr-2 bg-red-500 hover:bg-red-600"
          onClick={closeModal}>
          Nay
        </Button>
        <Button
          variant="warning"
          onClick={closeModal}>
          Cancel
        </Button>
      </div>
    </>
  )
}