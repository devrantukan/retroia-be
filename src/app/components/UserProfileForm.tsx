"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userProfileSchema,
  UserProfileFormData,
} from "@/lib/userProfileFormSchema";
import { submitUserProfile } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "./RichTextEditor";
import RichTextEditorAbout from "./RichTextEditorAbout";
import { z } from "zod";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function UserProfileForm({ officeWorker }: any) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [commercialDocumentId, setCommercialDocumentId] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [about, setAbout] = useState("");
  const [xAccountId, setXAccountId] = useState("");
  const [facebookAccountId, setFacebookAccountId] = useState("");
  const [linkedInAccountId, setLinkedInAccountId] = useState("");
  const [youtubeAccountId, setYoutubeAccountId] = useState("");
  const [instagramAccountId, setInstagramAccountId] = useState("");
  const [webUrl, setWebUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      surname: "",
      avatarUrl: "",
      about: "",
      phone: "",
      // title: "",
      xAccountId: "",
      facebookAccountId: "",
      linkedInAccountId: "",
      youtubeAccountId: "",
      webUrl: "",
      instagramAccountId: "",
      commercialDocumentId: "",
      companyLegalName: "",
      //   role: "",
      //   office: "",
    },
  });

  useEffect(() => {
    if (officeWorker) {
      form.setValue("name", officeWorker.name);
      setName(officeWorker.name);
      form.setValue("surname", officeWorker.surname);
      setSurname(officeWorker.surname);
      form.setValue("phone", officeWorker.phone);
      setPhone(officeWorker.phone);
      form.setValue("about", officeWorker.about);
      setAbout(officeWorker.about);

      form.setValue("commercialDocumentId", officeWorker.commercialDocumentId);
      setCommercialDocumentId(officeWorker.commercialDocumentId);
      form.setValue("companyLegalName", officeWorker.companyLegalName);
      setCompanyLegalName(officeWorker.companyLegalName);

      form.setValue("xAccountId", officeWorker.xAccountId);
      setXAccountId(officeWorker.xAccountId);

      form.setValue("facebookAccountId", officeWorker.facebookAccountId);
      setFacebookAccountId(officeWorker.facebookAccountId);

      form.setValue("linkedInAccountId", officeWorker.linkedInAccountId);
      setLinkedInAccountId(officeWorker.linkedInAccountId);

      form.setValue("youtubeAccountId", officeWorker.youtubeAccountId);
      setYoutubeAccountId(officeWorker.youtubeAccountId);

      form.setValue("instagramAccountId", officeWorker.instagramAccountId);
      setInstagramAccountId(officeWorker.instagramAccountId);

      form.setValue("webUrl", officeWorker.webUrl);
      setWebUrl(officeWorker.webUrl);
    }
  }, [officeWorker, form]);

  const onEditorStateChange = (about: string) => {
    setAbout(about);
    form.setValue("about", about);
  };

  async function onSubmit(data: z.infer<typeof userProfileSchema>) {
    console.log("formdata", data);
    setIsSubmitting(true);
    try {
      const result = await submitUserProfile(data, officeWorker.id);
      if (result.success) {
        toast.success("Kullanıcı kaydı güncellendi!");
        console.log("Form submitted successfully", result.data);
        // You can add a success message or redirect here
      } else {
        console.error("Form submission failed", result.errors);
        toast.error(
          result.errors ? result.errors.toString() : "An error occurred"
        );
        // You can set form errors here if needed
      }
    } catch (error) {
      console.error("An error occurred", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="font-bold text-xl">Kişisel ve İletişim Bilgileri</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adınız</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>Soyadınız</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                    value={surname}
                    onChange={(e) => {
                      setSurname(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>Cep Telefonu</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1234567890"
                    {...field}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hakkımda</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    {...field}
                    value={about}
                    onChange={(e) => {
                      setAbout(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>Max 500 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex flex-col md:col-span-3">
            <p className="text-sm mb-1 font-semibold">Detaylı Bilgi</p>
            <ReactQuill
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              className="h-[280px] border-gray-200 mb-6 "
              theme="snow"
              value={about}
              onChange={onEditorStateChange}
            />
          </div>
        </div>
        <hr />
        <h3 className="font-bold text-xl">Sosyal medya hesapları</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="xAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X (Twitter) </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Twitter Kullanıcı Adınız"
                    {...field}
                    value={xAccountId}
                    onChange={(e) => {
                      setXAccountId(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Facebook Kullanıcı Adınız"
                    {...field}
                    value={facebookAccountId}
                    onChange={(e) => {
                      setFacebookAccountId(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>LinkedIn </FormLabel>
                <FormControl>
                  <Input
                    placeholder="LinkedIn Kullanıcı Adınız"
                    {...field}
                    value={linkedInAccountId}
                    onChange={(e) => {
                      setLinkedInAccountId(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Youtube Kullanıcı Adınız"
                    {...field}
                    value={youtubeAccountId}
                    onChange={(e) => {
                      setYoutubeAccountId(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="webUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    value={webUrl}
                    onChange={(e) => {
                      setWebUrl(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>Instagram </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Instagram kullanıcı adınız"
                    {...field}
                    value={instagramAccountId}
                    onChange={(e) => {
                      setInstagramAccountId(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <hr />
        <h3 className="font-bold text-xl">Diğer Bilgiler</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="commercialDocumentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taşınmaz Ticareti Yetki Belgesi No</FormLabel>
                <FormControl>
                  <Input
                    placeholder="DOC123456"
                    {...field}
                    value={commercialDocumentId}
                    onChange={(e) => {
                      setCommercialDocumentId(e.target.value);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>İşletme Ünvanı</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Retroia"
                    {...field}
                    value={companyLegalName}
                    onChange={(e) => {
                      setCompanyLegalName(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kayıt Ediliyor." : "Kaydet"}
        </Button>
      </form>
    </Form>
  );
}
