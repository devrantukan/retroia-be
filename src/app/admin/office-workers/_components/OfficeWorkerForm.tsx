"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createOfficeWorker,
  updateOfficeWorker,
} from "@/lib/actions/office-worker";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ImageUploader from "@/app/admin/offices/_components/ImageUploader";
import {
  OfficeWorkerSchema,
  type OfficeWorkerFormType,
} from "@/lib/validations/office-worker";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const QuillEditor = dynamic(() => import("@/app/components/RichTextEditor"), {
  ssr: false,
});

type Office = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  title: string;
};

export function OfficeWorkerForm({ worker }: { worker?: any }) {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(worker?.avatarUrl || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [officesRes, rolesRes] = await Promise.all([
          fetch("/api/admin/offices"),
          fetch("/api/admin/roles"),
        ]);

        const officesData = await officesRes.json();
        const rolesData = await rolesRes.json();

        setOffices(officesData);
        setRoles(rolesData);
      } catch (error) {
        toast.error("Veriler yüklenirken bir hata oluştu");
      }
    };

    fetchData();
  }, []);

  const form = useForm<OfficeWorkerFormType>({
    resolver: zodResolver(OfficeWorkerSchema),
    defaultValues: worker
      ? {
          name: worker.name,
          surname: worker.surname,
          email: worker.email,
          phone: worker.phone,
          about: worker.about || "",
          roleId: worker.roleId?.toString(),
          officeId: worker.officeId?.toString(),
          webUrl: worker.webUrl || "",
          xAccountId: worker.xAccountId || "",
          facebookAccountId: worker.facebookAccountId || "",
          linkedInAccountId: worker.linkedInAccountId || "",
          instagramAccountId: worker.instagramAccountId || "",
          youtubeAccountId: worker.youtubeAccountId || "",
          commercialDocumentId: worker.commercialDocumentId || "",
          companyLegalName: worker.companyLegalName || "",
          userId: worker.userId || "",
        }
      : {
          name: "",
          surname: "",
          email: "",
          phone: "",
          about: "",
          roleId: "",
          officeId: "",
          webUrl: "",
          xAccountId: "",
          facebookAccountId: "",
          linkedInAccountId: "",
          instagramAccountId: "",
          youtubeAccountId: "",
          commercialDocumentId: "",
          companyLegalName: "",
          userId: "",
        },
  });

  const onSubmit = async (data: OfficeWorkerFormType) => {
    try {
      setLoading(true);
      const formData: OfficeWorkerFormType = {
        ...data,
        avatarUrl: avatarUrl || "",
        roleId: data.roleId.toString(),
        officeId: data.officeId.toString(),
      };

      if (worker) {
        await updateOfficeWorker(worker.id, formData);
        toast.success("Personel başarıyla güncellendi!");
      } else {
        await createOfficeWorker(formData);
        toast.success("Personel başarıyla eklendi!");
      }
      router.push("/admin/office-workers");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Fotoğraf</FormLabel>
                <ImageUploader
                  currentImage={avatarUrl}
                  onImageUpload={setAvatarUrl}
                  label="Personel Fotoğrafı"
                  officeName={form.watch("name")}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İsim</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soyisim</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Hakkında</FormLabel>
                <FormControl>
                  <div className="min-h-[300px]">
                    <QuillEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      className="h-[260px]"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="officeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ofis</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  defaultValue={worker?.officeId?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ofis seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {offices?.map((office) => (
                      <SelectItem key={office.id} value={office.id.toString()}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  defaultValue={worker?.roleId?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="webUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Sitesi</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="xAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X (Twitter) Hesabı</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebookAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook Hesabı</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedInAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Hesabı</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagramAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram Hesabı</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtubeAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube Hesabı</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commercialDocumentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticari Belge No</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyLegalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şirket Yasal Adı</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kinde User</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {worker ? "Güncelle" : "Oluştur"}
        </Button>
      </form>
    </Form>
  );
}
