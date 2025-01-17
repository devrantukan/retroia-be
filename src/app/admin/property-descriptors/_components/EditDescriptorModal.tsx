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
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      router.refresh();
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
    <Modal isOpen={true} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Tanımlayıcı Düzenle</ModalHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanımlayıcı Adı</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Select
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        selectedKeys={[field.value.toString()]}
                        className="max-w-xs"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Güncelle
                </Button>
              </form>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
