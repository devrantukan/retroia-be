"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { PencilIcon } from "@heroicons/react/16/solid";
import FileInput from "@/app/components/fileUpload";
import {
  getOfficeWorkerDetails,
  updateAvatarInDb,
} from "@/app/actions/updateAvatar";
import { uploadAvatar } from "@/lib/upload";
import { useRouter } from "next/navigation";

const UploadAvatar = ({ userId }: { userId: string }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [image, setImage] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!image) {
      onOpenChange();
      return;
    }

    setIsSubmitting(true);
    try {
      const officeWorker = await getOfficeWorkerDetails(userId);

      // Get the new avatar URL
      // const newUrl = await uploadAvatar(
      //   image,
      //   officeWorker.name,
      //   officeWorker.surname
      // );

      // Only update if the URL has changed
      // if (newUrl !== officeWorker.avatarUrl) {
      //   await updateAvatarInDb(userId, newUrl);
      //   router.refresh();
      // }

      onOpenChange();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={onOpen}>
        <PencilIcon className="w-6 text-slate-400 hover:text-primary transition-colors hidden " />
      </button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Profil Fotoğrafı Yükle
              </ModalHeader>
              <ModalBody>
                <FileInput
                  onChange={(e) => setImage((e as any).target.files[0])}
                  className="h-full"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  İptal
                </Button>
                <Button
                  isLoading={isSubmitting}
                  color="primary"
                  onPress={handleUpload}
                >
                  Fotoğrafı Değiştir
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UploadAvatar;
