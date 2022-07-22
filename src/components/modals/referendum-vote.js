import { Dialog } from "@headlessui/react";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";

export default function ReferendumVoteModal( { id, title } ) {
  const { closeModal } = useModal();

  const VOTE_LOCK_OPTIONS = [
    {
      value: '0.1',
      label: '0.1',
    },
    {
      value: '1',
      label: '1',
    },
    {
      value: '2',
      label: '2',
    },
  ]

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
          id="vote-amount"
          label="Value"
          type="number"
        />
        <Input
          id="vote-lock"
          label="Vote Lock"
          type="select"
          options={ VOTE_LOCK_OPTIONS }
        />
      </form>

      <div className="mt-6">
        <Button
          className="mr-2 bg-green-500"
          variant="warning"
          onClick={closeModal}>
          Aye
        </Button>
        <Button
          className="mr-2 bg-red-500"
          variant="warning"
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