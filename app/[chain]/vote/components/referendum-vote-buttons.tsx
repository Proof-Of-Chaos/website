"use client";

import Vote from "@w3f/polkadot-icons/keyline/Vote";
import { UIReferendum } from "../types";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useAppStore } from "@/app/zustand";
import ReferendumVoteModal from "./referendum-vote-modal";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";

export default function ReferendumVoteButtons({
  referendum,
  userVote,
  userDelegation,
}: {
  referendum: UIReferendum;
  userVote: any;
  userDelegation: any;
}) {
  const { selectedAccount, initiateConnection } = usePolkadotExtension();

  const openModal = useAppStore((state) => state.openModal);

  //TODO new modal
  return (
    <div>
      {!userDelegation && (
        <Button
          onClick={() =>
            selectedAccount?.address
              ? openModal(<ReferendumVoteModal referendum={referendum} />)
              : initiateConnection()
          }
          radius="sm"
          className="w-full h-unit-12 mb-2"
          color={!userVote ? "vivid" : "default"}
        >
          {!userVote ? "Vote Now" : "Vote Again"}{" "}
          <Vote width={18} height={18} stroke="currentColor" />
        </Button>
      )}
    </div>
  );
}
