"use client";

import DelegateModal from "@/app/[chain]/delegate/delegate-modal";
import { Button } from "@nextui-org/button";
import { useDisclosure } from "@nextui-org/modal";

export function DelegateButton() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="bordered"
        size="lg"
        isIconOnly={false}
        className="min-w-unit-10 px-3"
        onClick={onOpenChange}
      >
        Delegate
      </Button>
      <DelegateModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
