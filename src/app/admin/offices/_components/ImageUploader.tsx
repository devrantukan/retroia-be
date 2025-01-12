"use client";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { uploadToSupabase } from "@/lib/utils";

interface Props {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  label?: string;
}

export default function ImageUploader({
  currentImage,
  onImageUpload,
  label,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setUploading(true);
        const url = await uploadToSupabase(file);
        onImageUpload(url);
        setPreviewUrl(url);
        toast.success("Görsel başarıyla yüklendi!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Görsel yüklenirken bir hata oluştu!");
      } finally {
        setUploading(false);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label || "Görsel"}
      </label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isDragActive ? "border-primary" : "border-gray-300"}
          hover:border-primary transition-colors`}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <div className="relative w-full h-40">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Görseli buraya bırakın"
                : "Görsel yüklemek için tıklayın veya sürükleyin"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 5MB)</p>
          </div>
        )}
      </div>

      {previewUrl && (
        <Button
          color="danger"
          variant="light"
          size="sm"
          onClick={() => {
            setPreviewUrl("");
            onImageUpload("");
          }}
        >
          Görseli Kaldır
        </Button>
      )}
    </div>
  );
}
