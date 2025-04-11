"use client";

import { Button, Card, cn, Spinner } from "@nextui-org/react";
import React, { useState, useCallback, useEffect } from "react";
import { OfficeImage } from "@prisma/client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import FileInput from "@/app/components/fileUpload";
import Image from "next/image";
import { Trash } from "lucide-react";
import { uploadImages } from "@/lib/upload";

interface OfficeImageUploaderProps {
  images: File[];
  setImages: (images: File[]) => void;
  deletedImages: number[];
  setDeletedImages: (ids: number[]) => void;
  existingImages?: OfficeImage[];
  setExistingImages?: React.Dispatch<React.SetStateAction<OfficeImage[]>>;
  className?: string;
}

type UnifiedImage = {
  id: string;
  url: string;
  type: "existing" | "new";
  originalData: OfficeImage | File;
  order: number;
  isLoading?: boolean;
};

const OfficeImageUploader = ({
  setImages,
  images,
  className,
  deletedImages,
  setDeletedImages,
  existingImages = [],
  setExistingImages,
}: OfficeImageUploaderProps) => {
  // Initialize unified images with order
  const [unifiedImages, setUnifiedImages] = useState<UnifiedImage[]>(() => {
    const existing =
      existingImages?.map((img, idx) => ({
        id: `existing-${img.id}`,
        url: img.url,
        type: "existing" as const,
        originalData: img,
        order: idx,
      })) || [];

    const newImages = images.map((file, idx) => ({
      id: `new-${idx}`,
      url: file instanceof File ? URL.createObjectURL(file) : file,
      type: "new" as const,
      originalData: file,
      order: existing.length + idx,
    }));

    return [...existing, ...newImages];
  });

  const [isUploading, setIsUploading] = useState(false);

  // Update unified images when props change
  useEffect(() => {
    const existing =
      existingImages
        ?.filter((img) => !deletedImages.includes(img.id))
        .map((img, idx) => ({
          id: `existing-${img.id}`,
          url: img.url,
          type: "existing" as const,
          originalData: img,
          order: idx,
        })) || [];

    const newImages = images.map((file, idx) => ({
      id: `new-${idx}`,
      url: file instanceof File ? URL.createObjectURL(file) : file,
      type: "new" as const,
      originalData: file,
      order: existing.length + idx,
    }));

    setUnifiedImages([...existing, ...newImages]);

    // Cleanup URLs
    return () => {
      newImages.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [existingImages, images, deletedImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    const newFiles = Array.from(files);

    // Add new files with loading state
    const newUnifiedImages = newFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      type: "new" as const,
      originalData: file,
      order: unifiedImages.length + idx,
      isLoading: true,
    }));

    setUnifiedImages((prev) => {
      const activeImages = prev.filter((img) => {
        if (img.type === "existing") {
          const originalImage = img.originalData as OfficeImage;
          return !deletedImages.includes(originalImage.id);
        }
        return true;
      });
      return [...activeImages, ...newUnifiedImages];
    });

    try {
      setImages([...images, ...newFiles]);
      setUnifiedImages((prev) => {
        const activeImages = prev.filter((img) => {
          if (img.type === "existing") {
            const originalImage = img.originalData as OfficeImage;
            return !deletedImages.includes(originalImage.id);
          }
          return true;
        });
        return activeImages.map((img) =>
          newUnifiedImages.some((newImg) => newImg.id === img.id)
            ? { ...img, isLoading: false }
            : img
        );
      });
    } catch (error) {
      console.error("Error processing files:", error);
      setUnifiedImages((prev) => {
        const activeImages = prev.filter((img) => {
          if (img.type === "existing") {
            const originalImage = img.originalData as OfficeImage;
            return !deletedImages.includes(originalImage.id);
          }
          return true;
        });
        return activeImages.filter(
          (img) => !newUnifiedImages.some((newImg) => newImg.id === img.id)
        );
      });
    } finally {
      setIsUploading(false);
    }
  };

  const moveImage = async (
    fromIndex: number,
    toIndex: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const currentImages = [...unifiedImages];
      const [movedImage] = currentImages.splice(fromIndex, 1);
      currentImages.splice(toIndex, 0, movedImage);

      const updatedImages = currentImages.map((img, idx) => ({
        ...img,
        order: idx,
        originalData:
          img.type === "existing"
            ? { ...(img.originalData as OfficeImage), order: idx }
            : img.originalData,
      }));

      setUnifiedImages(updatedImages);

      const existingWithNewOrders = updatedImages
        .filter((img) => img.type === "existing")
        .map((img) => img.originalData as OfficeImage);

      if (existingImages && existingWithNewOrders.length > 0) {
        const activeExisting = existingWithNewOrders.filter(
          (img) => !deletedImages.includes(img.id)
        );
        setExistingImages?.(activeExisting);
      }

      const newUploaded = updatedImages
        .filter((img) => img.type === "new")
        .map((img) => img.originalData as File);
      setImages(newUploaded);
    } catch (error) {
      console.error("Error during image move:", error);
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-xl font-semibold">Görüntüler Yükleniyor...</p>
            <p className="text-sm text-gray-500">Lütfen bekleyin</p>
          </div>
        </div>
      )}
      <FileInput multiple={true} onSelect={handleFileSelect} className="mb-6" />
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unifiedImages.map((image, index) => (
            <div key={image.id} className="relative group w-full aspect-video">
              {image.isLoading ? (
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                </div>
              ) : (
                <Image
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={image.url.startsWith("blob:")}
                  priority={index < 3}
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => moveImage(index, index - 1, e)}
                    className={cn(
                      "p-2 rounded-full hover:bg-white/20 transition-colors",
                      index > 0
                        ? "bg-white/10 cursor-pointer"
                        : "bg-white/5 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (image.type === "existing") {
                        const originalImage = image.originalData as OfficeImage;
                        setDeletedImages([...deletedImages, originalImage.id]);
                      } else {
                        const newImages = images.filter((_, i) => i !== index);
                        setImages(newImages);
                      }
                      setUnifiedImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Trash className="w-6 h-6 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => moveImage(index, index + 1, e)}
                    className={cn(
                      "p-2 rounded-full hover:bg-white/20 transition-colors",
                      index < unifiedImages.length - 1
                        ? "bg-white/10 cursor-pointer"
                        : "bg-white/5 cursor-not-allowed"
                    )}
                  >
                    <ChevronRightIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default OfficeImageUploader;
