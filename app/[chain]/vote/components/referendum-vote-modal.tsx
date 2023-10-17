"use client";

import { ModalBody, ModalHeader } from "@nextui-org/modal";
import { UIReferendum } from "../types";
import { ReferendumVoteForm } from "./referendum-vote-form";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export default function ReferendumVoteModal({
  referendum,
}: {
  referendum: UIReferendum;
}) {
  const { index, title } = referendum;
  const { activeChainName, activeChainInfo } = usePolkadotApis();
  return (
    <>
      <ModalHeader>
        <h1 className="text-xl flex items-center">
          <span className="mr-2">
            {activeChainName && <activeChainInfo.icon width={50} height={50} />}
          </span>
          Vote on Referendum {index}
        </h1>
      </ModalHeader>
      <ModalBody>
        <div className="mt-2">{title}</div>
        <ReferendumVoteForm referendumId={index} />
      </ModalBody>
    </>
  );
}
