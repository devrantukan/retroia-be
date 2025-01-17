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
import { Form } from "@/components/ui/form";
import {
  CategoryFormData,
  categorySchema,
} from "@/lib/validations/property-descriptor";
import { createCategory } from "@/lib/actions/property-descriptor";
import { PropertyType } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyTypes: PropertyType[];
  onSuccess: (category: any) => void;
}

export default function AddCategoryModal({
  open,
  onClose,
  propertyTypes,
  onSuccess,
}: Props) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      value: "",
      slug: "",
      typeId: 0,
    },
  });
  const router = useRouter();

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const result = await createCategory(data);
      toast.success("Kategori başarıyla oluşturuldu", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onSuccess(result);
      form.reset();
      onClose();
      //router.refresh();
      window.location.reload();
    } catch (error) {
      toast.error("Kategori oluşturulurken bir hata oluştu", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Yeni Kategori Ekle</ModalHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <ModalBody>
                  <Input
                    label="Kategori Adı"
                    {...form.register("value")}
                    errorMessage={form.formState.errors.value?.message}
                  />
                  <Input
                    label="Slug"
                    {...form.register("slug")}
                    errorMessage={form.formState.errors.slug?.message}
                  />
                  <Select
                    label="Mülk Tipi"
                    onChange={(e) =>
                      form.setValue("typeId", Number(e.target.value))
                    }
                    selectedKeys={[form.getValues("typeId").toString()]}
                  >
                    {propertyTypes.map((type) => (
                      <SelectItem
                        key={type.id.toString()}
                        value={type.id.toString()}
                      >
                        {type.value}
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
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
