"use client";

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

import { pick } from "lodash";

import ReactJson from "react-json-view";

type PropType = Omit<ModalProps, "children"> & {
  sendoutData: GenerateRewardsResult;
};

export default function ModalAnalyzeSendout({
  sendoutData,
  ...props
}: PropType) {
  const { isOpen, onOpenChange } = props;

  const displayedData = pick(sendoutData, [
    // "kusamaAssetHubTxsBatches",
    "kusamaAssetHubTxsHuman",
    "distribution",
    "voters",
    "config",
    "txsCount",
  ]);

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
              {displayedData ? (
                <div className="overflow-hidden overflow-y-scroll">
                  <ReactJson
                    theme="chalk"
                    src={displayedData}
                    iconStyle="circle"
                  />
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
