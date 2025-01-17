import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export default function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: Props) {
  return (
    <Modal isOpen={open} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{description}</ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                İptal
              </Button>
              <Button color="danger" onPress={onConfirm}>
                Sil
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
