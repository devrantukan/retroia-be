"use client";
import { deleteProperty } from "@/lib/actions/property";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Props {
  params: { id: string };
}
const ModalDeletePropertyPage = ({ params }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handldeDelete = async () => {
    try {
      await deleteProperty(Number(params.id));

      //  router.push("/user/properties");
      router.refresh();

      setIsOpen(false);
    } catch (e) {
      throw e;
    }
  };

  const handleCancel = () => {
    //  router.push("/user/properties");
    window.location.assign("/user/properties");
    setIsOpen(false);
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={handleCancel}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">İlanı Sil</ModalHeader>
        <ModalBody>
          <p>İlanı silmek istediğinizden emin misiniz?</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCancel}>İptal</Button>
          <Button onClick={handldeDelete} color="danger" variant="light">
            Sil
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalDeletePropertyPage;
