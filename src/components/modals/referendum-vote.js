import { Dialog } from "@headlessui/react";
import { ReferendumVoteForm } from "../ui/referendum/referendum-vote-form";

export default function ReferendumVoteModal( { index, title, userAnswers, gov2 = false} ) {
  return(
    <>
      <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-gray-900">
        Vote on Referendum { index }
      </Dialog.Title>
      <div className="pr-4 overflow-y-scroll flex-1">
        <div className="mt-2 text-sm">
          { title }
        </div>
        <ReferendumVoteForm referendumId={ index } />
      </div>
    </>
  )
}