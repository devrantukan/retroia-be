"use client";
import FileInput from "@/app/components/fileUpload";
import { Button, Card, cn, Input } from "@nextui-org/react";
import React, {
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
  useState,
  useMemo,
} from "react";
import PictureCard from "./PictureCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { PropertyImage } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";

interface PictureProps {
  images: File[];
  setImages: (images: File[]) => void;
  deletedImages: number[];
  setDeletedImages: (ids: number[]) => void;
  existingImages?: PropertyImage[];
  setExistingImages?: Dispatch<SetStateAction<PropertyImage[]>>;
  className?: string;
  next?: () => void;
  prev?: () => void;
  savedImagesUrl?: PropertyImage[];
  setSavedImageUrl?: React.Dispatch<React.SetStateAction<PropertyImage[]>>;
}

type UnifiedImage = {
  id: string;
  url: string;
  type: "existing" | "new";
  originalData: PropertyImage | File;
  order: number;
  isLoading?: boolean;
};

const Picture = ({
  setSavedImageUrl,
  savedImagesUrl,
  setImages,
  images,
  className,
  next,
  prev,
  deletedImages,
  setDeletedImages,
  existingImages = [],
  setExistingImages,
}: PictureProps) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext<AddPropertyInputType>();

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

    // Set uploading state immediately
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

    // Update unified images with loading state, filtering out deleted images
    setUnifiedImages((prev) => {
      const activeImages = prev.filter((img) => {
        if (img.type === "existing") {
          const originalImage = img.originalData as PropertyImage;
          return !deletedImages.includes(originalImage.id);
        }
        return true;
      });
      return [...activeImages, ...newUnifiedImages];
    });

    // Process files
    try {
      // Simulate file processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update images array
      setImages([...images, ...newFiles]);

      // Remove loading state and filter out deleted images
      setUnifiedImages((prev) => {
        const activeImages = prev.filter((img) => {
          if (img.type === "existing") {
            const originalImage = img.originalData as PropertyImage;
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
      // Remove failed uploads and filter out deleted images
      setUnifiedImages((prev) => {
        const activeImages = prev.filter((img) => {
          if (img.type === "existing") {
            const originalImage = img.originalData as PropertyImage;
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

  const handleDelete = (
    index: number,
    imageId?: number,
    e?: React.MouseEvent
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (imageId !== undefined) {
      // Handle existing image deletion
      setDeletedImages([...deletedImages, imageId]);
    } else {
      // Handle new image deletion
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  const handleSavedDelete = useCallback(
    (id: number) => {
      setSavedImageUrl?.((prev) => prev.filter((img) => img.id !== id));
    },
    [setSavedImageUrl]
  );

  const moveImage = async (
    fromIndex: number,
    toIndex: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Simple array move for unified images
      const currentImages = [...unifiedImages];
      const [movedImage] = currentImages.splice(fromIndex, 1);
      currentImages.splice(toIndex, 0, movedImage);

      // Update orders based on new positions
      const updatedImages = currentImages.map((img, idx) => ({
        ...img,
        order: idx,
        originalData:
          img.type === "existing"
            ? { ...(img.originalData as PropertyImage), order: idx }
            : img.originalData,
      }));

      // Update unified images
      setUnifiedImages(updatedImages);

      // Update existing images with new orders
      const existingWithNewOrders = updatedImages
        .filter((img) => img.type === "existing")
        .map((img) => img.originalData as PropertyImage);

      if (existingImages && existingWithNewOrders.length > 0) {
        const activeExisting = existingWithNewOrders.filter(
          (img) => !deletedImages.includes(img.id)
        );
        setExistingImages?.(activeExisting);
      }

      // Update new images array
      const newUploaded = updatedImages
        .filter((img) => img.type === "new")
        .map((img) => img.originalData as File);
      setImages(newUploaded);
    } catch (error) {
      console.error("Error during image move:", error);
    }
  };

  // Create URLs for new images
  const imageUrls = useMemo(() => {
    return images.map((file) => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return ""; // Return empty string for invalid files
    });
  }, [images]);

  // Cleanup URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const [isUploading, setIsUploading] = useState(false);

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
      <div className="grid grid-cols-1 gap-4" aria-label="Property Images Grid">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Property Images Container"
        >
          {unifiedImages.map((image, index) => (
            <PictureCard
              key={image.id}
              src={image.url}
              index={index}
              isLoading={image.isLoading}
              onDelete={() => {
                if (image.type === "existing") {
                  const originalImage = image.originalData as PropertyImage;
                  setDeletedImages([...deletedImages, originalImage.id]);
                } else {
                  // Handle new image deletion
                  const newImages = images.filter((_, i) => i !== index);
                  setImages(newImages);
                }
                // Update unified images by filtering out the deleted image
                setUnifiedImages((prev) => prev.filter((_, i) => i !== index));
              }}
              onMoveLeft={
                index > 0 ? (e) => moveImage(index, index - 1, e) : undefined
              }
              onMoveRight={
                index < unifiedImages.length - 1
                  ? (e) => moveImage(index, index + 1, e)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-y-4">
        <Input
          {...register("videoSource")}
          errorMessage={errors.videoSource?.message}
          isInvalid={!!errors.videoSource}
          label="Video Url"
          name="videoSource"
          defaultValue={getValues().videoSource}
        />
        <Input
          {...register("threeDSource")}
          errorMessage={errors.threeDSource?.message}
          isInvalid={!!errors.threeDSource}
          label="3d Url "
          name="threeDSource"
          defaultValue={getValues().threeDSource}
        />
      </div>
      <div className="flex justify-center col-span-2 gap-3 mt-3">
        <Button
          onClick={prev}
          startContent={<ChevronLeftIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          Geri
        </Button>
        <Button
          onClick={next}
          endContent={<ChevronRightIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          İleri
        </Button>
      </div>
    </Card>
  );
};

export default Picture;
