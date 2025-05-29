"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea } from "@nextui-org/react";
import { ContentInputType, contentSchema } from "@/lib/validations/content";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { revalidatePath } from "next/cache";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Add custom styles for Quill editor
const quillStyles = `
  .ql-container {
    background-color: var(--nextui-colors-content1);
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    border: 1px solid var(--nextui-colors-divider);
    height: 300px;
  }
  .ql-toolbar {
    background-color: var(--nextui-colors-content1);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    border: 1px solid var(--nextui-colors-divider);
    border-bottom: none;
  }
  .ql-editor {
    min-height: 250px;
  }
  .ql-editor.ql-blank::before {
    color: var(--nextui-colors-foreground-400);
    font-style: normal;
  }
`;

interface ContentFormProps {
  initialData?: ContentInputType & { id: string };
}

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const REVALIDATION_TOKEN = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;

async function revalidateFrontend(path: string) {
  try {
    if (!FRONTEND_URL || !REVALIDATION_TOKEN) {
      console.warn("Missing revalidation environment variables");
      return;
    }

    const response = await fetch(`${FRONTEND_URL}/api/revalidate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({
        path,
        token: REVALIDATION_TOKEN,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Revalidation failed for ${path}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
    }
  } catch (error) {
    console.error(`Revalidation error for ${path}:`, error);
  }
}

const revalidatePages = async () => {
  await Promise.all([
    revalidateFrontend("/emlak/biz-kimiz/"),
    revalidateFrontend("/emlak/kvkk-ve-aydinlatma-metni/"),
  ]);
};

export function ContentForm({ initialData }: ContentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContentInputType>({
    resolver: zodResolver(contentSchema),
    defaultValues: initialData,
  });

  const richTextValue = watch("value");

  const createContent = async (data: ContentInputType) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create content");
      }

      await revalidatePages();
      toast.success("İçerik başarıyla oluşturuldu");
      router.push("/admin/contents");
    } catch (error) {
      console.error("Error creating content:", error);
      toast.error("İçerik oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContent = async (data: ContentInputType) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contents/${initialData?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update content");
      }

      await revalidatePages();
      toast.success("İçerik başarıyla güncellendi");
      router.push("/admin/contents");
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("İçerik güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: ContentInputType) => {
    if (initialData) {
      updateContent(data);
    } else {
      createContent(data);
    }
  };

  return (
    <>
      <style>{quillStyles}</style>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Anahtar"
            {...register("key")}
            isInvalid={!!errors.key}
            errorMessage={errors.key?.message}
            classNames={{
              inputWrapper: "bg-content1",
            }}
          />
        </div>

        <div>
          <div className="mb-4">
            <ReactQuill
              theme="snow"
              value={richTextValue || ""}
              onChange={(value) => setValue("value", value)}
              placeholder="Değer"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ indent: "-1" }, { indent: "+1" }],
                  [{ align: [] }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
            />
          </div>
          {errors.value && (
            <p className="text-danger text-sm">{errors.value.message}</p>
          )}
        </div>

        <div>
          <Textarea
            label="Açıklama"
            {...register("description")}
            isInvalid={!!errors.description}
            errorMessage={errors.description?.message}
            classNames={{
              inputWrapper: "bg-content1",
            }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            color="danger"
            variant="light"
            onPress={() => router.push("/admin/contents")}
          >
            İptal
          </Button>
          <Button type="submit" color="primary" isLoading={isSubmitting}>
            {initialData ? "Güncelle" : "Oluştur"}
          </Button>
        </div>
      </form>
    </>
  );
}
