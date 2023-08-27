import { Dialog } from "@headlessui/react";
import { ReferendumVoteForm } from "../ui/referendum/referendum-vote-form";
import { ModalBody, ModalHeader } from "@nextui-org/react";

export default function ReferendumVoteModal({
  index,
  title,
  userAnswers,
  gov2 = false,
}) {
  return (
    <>
      <ModalHeader
        as="h3"
        className="text-2xl font-medium leading-6 text-gray-900"
      >
        Vote on Referendum {index}
      </ModalHeader>
      <ModalBody className="pr-4 overflow-y-scroll flex-1">
        <div className="mt-2 text-sm">{title}</div>
        <ReferendumVoteForm referendumId={index} />
      </ModalBody>
    </>
  );
}
