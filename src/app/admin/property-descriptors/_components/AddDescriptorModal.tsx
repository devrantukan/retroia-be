"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import {
  DescriptorFormData,
  descriptorSchema,
} from "@/lib/validations/property-descriptor";
import { createDescriptor } from "@/lib/actions/property-descriptor";
import { PropertyDescriptorCategory, PropertyType } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: (PropertyDescriptorCategory & {
    type: { id: number; value: string };
  })[];
  onSuccess: (descriptor: any) => void;
}

export default function AddDescriptorModal({
  open,
  onClose,
  categories,
  onSuccess,
}: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DescriptorFormData>({
    resolver: zodResolver(descriptorSchema),
  });

  const onSubmit = async (data: DescriptorFormData) => {
    try {
      const result = await createDescriptor({
        value: data.value,
        slug: data.slug,
        categoryId: Number(data.categoryId),
      });
      toast.success("Tanımlayıcı başarıyla oluşturuldu");
      onSuccess(result);
      reset();
      onClose();
      //  router.refresh();
      window.location.reload();
    } catch (error) {
      toast.error("Tanımlayıcı oluşturulurken bir hata oluştu");
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Yeni Tanımlayıcı Ekle</ModalHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <ModalBody>
                <Input
                  label="Tanımlayıcı Adı"
                  {...register("value")}
                  errorMessage={errors.value?.message}
                />
                <Input
                  label="Slug"
                  {...register("slug")}
                  errorMessage={errors.slug?.message}
                />
                <Select
                  label="Kategori"
                  onChange={(e) =>
                    setValue("categoryId", Number(e.target.value))
                  }
                  errorMessage={errors.categoryId?.message}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.value}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  İptal
                </Button>
                <Button color="primary" type="submit">
                  Ekle
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
