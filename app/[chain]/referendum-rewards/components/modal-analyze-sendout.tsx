import { CollectionConfiguration, GenerateRewardsResult } from "../types";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import ReactJson from "react-json-view";

type PropType = Omit<ModalProps, "children"> & {
  sendoutData: GenerateRewardsResult;
};

export default function ModalAnalyzeSendout({
  sendoutData,
  ...props
}: PropType) {
  const { isOpen, onOpenChange } = props;

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
              Analzye Reward Sendout
            </ModalHeader>

            <ModalBody>
              {sendoutData ? (
                <div className="overflow-scroll">
                  {/* <ReactJson
                    theme="chalk"
                    src={sendoutData}
                    collapsed={true}
                    collapseStringsAfterLength={false}
                    iconStyle="circle"
                  /> */}
                </div>
              ) : (
                "Error reading sendout data"
              )}
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
