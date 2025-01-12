"use client";

import { useCallback, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Button } from "./ui/button";
import { toast } from "react-toastify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (url: string) => void;
}

export function ImageUpload({ value, onChange, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setUploading(true);

        if (!event.target.files || event.target.files.length === 0) {
          throw new Error("Lütfen bir resim seçin");
        }

        const file = event.target.files[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `office-workers/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;
        onUpload(url);
      } catch (error) {
        console.log(error);
        toast.error("Resim yüklenirken bir hata oluştu");
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={() => document.getElementById("imageInput")?.click()}
          disabled={uploading}
        >
          {uploading ? "Yükleniyor..." : "Resim Yükle"}
        </Button>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
      {value && (
        <div className="relative h-40 w-40">
          <Image
            src={value}
            alt="Uploaded"
            className="object-cover rounded-md"
            fill
          />
        </div>
      )}
    </div>
  );
}
