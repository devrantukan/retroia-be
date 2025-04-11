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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DescriptorFormData,
  descriptorSchema,
} from "@/lib/validations/property-descriptor";
import { updateDescriptor } from "@/lib/actions/property-descriptor";
import {
  PropertyDescriptor,
  PropertyDescriptorCategory,
  PropertyType,
} from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  descriptor: PropertyDescriptor;
  categories: (PropertyDescriptorCategory & {
    type: { id: number; value: string };
  })[];
  onClose: () => void;
  onSuccess: (descriptor: any) => void;
}

export default function EditDescriptorModal({
  descriptor,
  categories,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const form = useForm<DescriptorFormData>({
    resolver: zodResolver(descriptorSchema),
    defaultValues: {
      value: descriptor.value,
      slug: descriptor.slug,
      categoryId: descriptor.categoryId,
    },
  });

  const onSubmit = async (data: DescriptorFormData) => {
    try {
      const result = await updateDescriptor(descriptor.id, data);
      toast.success("Tanımlayıcı başarıyla güncellendi", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onSuccess(result);
      onClose();
      window.location.assign("/admin/property-descriptors");
    } catch (error) {
      toast.error("Tanımlayıcı güncellenirken bir hata oluştu", {
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
    <Modal isOpen={true} onOpenChange={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
              Tanımlayıcı Düzenle
            </ModalHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <ModalBody className="space-y-6">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanımlayıcı Adı</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tanımlayıcı adını giriniz"
                            errorMessage={form.formState.errors.value?.message}
                            isInvalid={!!form.formState.errors.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Slug değerini giriniz"
                            errorMessage={form.formState.errors.slug?.message}
                            isInvalid={!!form.formState.errors.slug}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            placeholder="Kategori seçiniz"
                            selectedKeys={
                              field.value ? [field.value.toString()] : []
                            }
                            onChange={(e) => {
                              const value = e.target.value
                                ? Number(e.target.value)
                                : null;
                              field.onChange(value);
                            }}
                            errorMessage={
                              form.formState.errors.categoryId?.message
                            }
                            isInvalid={!!form.formState.errors.categoryId}
                            className="max-w-full"
                            value={field.value?.toString()}
                          >
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id.toString()}
                                value={category.id.toString()}
                              >
                                {category.value}
                              </SelectItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    İptal
                  </Button>
                  <Button color="primary" type="submit">
                    Güncelle
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
