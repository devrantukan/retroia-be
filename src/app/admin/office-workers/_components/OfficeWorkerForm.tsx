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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { createClient } from "@supabase/supabase-js";

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  roleId: z.string(),
  officeId: z.string(),
  about: z.string().min(10, "Hakkında kısmı en az 10 karakter olmalıdır"),
  avatarUrl: z.string().optional(),
  webUrl: z
    .string()
    .url("Geçerli bir web adresi giriniz")
    .optional()
    .or(z.literal("")),
  xAccountId: z.string().optional().or(z.literal("")),
  facebookAccountId: z.string().optional().or(z.literal("")),
  linkedInAccountId: z.string().optional().or(z.literal("")),
  instagramAccountId: z.string().optional().or(z.literal("")),
  youtubeAccountId: z.string().optional().or(z.literal("")),
  commercialDocumentId: z.string().optional().or(z.literal("")),
  companyLegalName: z.string().optional().or(z.literal("")),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır"),
});

type Office = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function OfficeWorkerForm({ worker }: { worker?: any }) {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: worker || {
      name: "",
      surname: "",
      email: "",
      phone: "",
      about: "",
      webUrl: "",
      xAccountId: "",
      facebookAccountId: "",
      linkedInAccountId: "",
      instagramAccountId: "",
      youtubeAccountId: "",
      commercialDocumentId: "",
      companyLegalName: "",
      slug: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (worker) {
        await updateOfficeWorker(worker.id, values);
        toast.success("Çalışan başarıyla güncellendi");
      } else {
        await createOfficeWorker(values);
        toast.success("Çalışan başarıyla oluşturuldu");
      }
      router.push("/admin/office-workers");
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Profil Fotoğrafı</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onUpload={(url: string) => field.onChange(url)}
                  />
                </FormControl>
                <FormMessage />
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
                  <Textarea {...field} rows={4} />
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
                  defaultValue={field.value}
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
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
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
                <FormLabel>Ticari Belge ID</FormLabel>
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
        </div>

        <Button type="submit">{worker ? "Güncelle" : "Oluştur"}</Button>
      </form>
    </Form>
  );
}
