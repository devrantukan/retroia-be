"use client";

import { Button } from "@nextui-org/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { uploadProjectImage } from "@/lib/utils";
import slugify from "slugify";

interface Props {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  label?: string;
  projectName?: string;
}

export default function ProjectImageUploader({
  currentImage,
  onImageUpload,
  label,
  projectName,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const slug = projectName
          ? slugify(projectName, { lower: true, strict: true })
          : "";
        const url = await uploadProjectImage(file, slug);
        onImageUpload(url);
        setPreviewUrl(url);
        toast.success("Proje görseli başarıyla yüklendi!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Proje görseli yüklenirken bir hata oluştu");
      }
    },
    [projectName, onImageUpload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setUploading(true);
        await handleImageUpload(file);
      } finally {
        setUploading(false);
      }
    },
    [handleImageUpload]
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
        {label || "Proje Görseli"}
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
