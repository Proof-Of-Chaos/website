import { Dialog } from "@headlessui/react";
import Button from "../ui/button";
import { useModal } from "./context";

export default function SelectWalletModal() {
  const { closeModal } = useModal();
  return(
    <>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
        Select Wallet
      </Dialog.Title>
      <div className="mt-2">
        <ul>
          <li>Polkadot.js</li>
          <li>Talisman</li>
        </ul>
      </div>

      <div className="mt-4">
        <Button
          variant="warning"
          onClick={closeModal}>
          Cancel
        </Button>
      </div>
    </>
  )
}