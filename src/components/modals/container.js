import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from 'react'
import Button from "../ui/button";
import { useModal } from "./context";
import ReferendumVoteModal from "./referendum-vote";
import SelectWalletModal from "./select-wallet";

function renderModalContent(view, props={}){
  switch(view) {
    case 'VIEW_CONNECT_WALLET':
      return <SelectWalletModal />
    case 'VIEW_REFERENDUM_VOTE':
      return <ReferendumVoteModal {...props}/>
    default:
      return null
  }
}

export default function ModalsContainer() {
  const { view, props, isOpen, closeModal } = useModal();

  return(
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50 overflow-visible"
        onClose={closeModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 z-40 cursor-pointer bg-gray-700 bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Dialog.Panel}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              { view && renderModalContent(view, props) }
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}