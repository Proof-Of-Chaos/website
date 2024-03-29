"use client";

import Vote from "@w3f/polkadot-icons/keyline/Vote";
import { UIReferendum } from "../types";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useAppStore } from "@/app/zustand";
import ReferendumVoteModal from "./referendum-vote-modal";

export default function ReferendumVoteButtons({
  referendum,
  userVote,
}: {
  referendum: UIReferendum;
  userVote: any;
}) {
  const openModal = useAppStore((state) => state.openModal);

  //TODO new modal
  return (
    <div>
      <Button
        onClick={() =>
          openModal(<ReferendumVoteModal referendum={referendum} />)
        }
        radius="sm"
        className="w-full h-unit-12 mb-2"
        color="vivid"
      >
        Vote Now <Vote width={18} height={18} stroke="currentColor" />
      </Button>
    </div>
  );
}
