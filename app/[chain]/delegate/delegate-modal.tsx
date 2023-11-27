"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@nextui-org/modal";
import { DelegateForm } from "./delegate-form";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { Button } from "@nextui-org/button";

type PropType = Omit<ModalProps, "children">;

export default function DelegateModal(props: PropType) {
  const { isOpen, onOpenChange } = props;
  const { activeChainName, activeChainInfo } = usePolkadotApis();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="2xl"
      radius="sm"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Delegate To Proof Of Chaos
            </ModalHeader>
            <ModalBody>
              <DelegateForm />
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
