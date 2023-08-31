import { Fragment } from "react";
// import Button from "../ui/button";
import { useModal } from "./context";
import PastReferendumModal from "./past-ref-modal";
import ReferendumQuizModal from "./referendum-quiz";
import ReferendumVoteModal from "./referendum-vote";
import CreateNFTCollectionModal from "./create-collection-modal";
import { Modal, ModalContent, Button, useDisclosure } from "@nextui-org/react";

function renderModalContent(view, props = {}) {
  console.log("rendermodal content ", view, props);
  switch (view) {
    case "VIEW_REFERENDUM_VOTE":
      return <ReferendumVoteModal {...props} />;
    case "VIEW_REFERENDUM_QUIZ":
      return <ReferendumQuizModal {...props} />;
    case "PAST_REFERENDUM_DETAIL":
      return <PastReferendumModal {...props} />;
    case "NEW_NFT_COLLECTION":
      return <CreateNFTCollectionModal {...props} />;
    default:
      return null;
  }
}

export default function ModalsContainer() {
  const { view, props, isOpen, closeModal } = useModal();
  const { onOpenChange, onClose } = useDisclosure();

  return (
    <Modal isOpen={isOpen} onOpenChange={closeModal}>
      <ModalContent>
        {(onClose) => (
          <>
            {view &&
              renderModalContent(view, {
                ...props,
              })}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
