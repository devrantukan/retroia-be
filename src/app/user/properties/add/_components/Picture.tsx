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
import ImageResizer from "./ImageResizer";

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

    // For new images, they are already resized
    const newImages = images.map((file, idx) => ({
      id: `new-${idx}`,
      url: URL.createObjectURL(file),
      type: "new" as const,
      originalData: file,
      order: existing.length + idx,
    }));

    setUnifiedImages([...existing, ...newImages]);

    // Cleanup URLs
    return () => {
      // Cleanup existing image URLs
      existing.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });

      // Cleanup new image URLs
      newImages.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [existingImages, images, deletedImages]);

  const [resizingImage, setResizingImage] = useState<{
    file: File;
    bucket: "propertyImages" | "property-images" | "thumbnails-property-images";
  } | null>(null);

  const handleResizedImage = useCallback(
    (resizedFile: File) => {
      if (!resizingImage) return;

      // Update the image in the images array
      const newImages = [...images, resizedFile];
      setImages(newImages);

      // Update the unified images
      setUnifiedImages((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          url: URL.createObjectURL(resizedFile),
          type: "new" as const,
          originalData: resizedFile,
          order: prev.length,
          isLoading: false,
        },
      ]);

      setResizingImage(null);
    },
    [images, resizingImage, setImages]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Set uploading state immediately
    setIsUploading(true);

    const newFiles = Array.from(files);
    const processedFiles: File[] = [];

    try {
      // Process each file
      for (const file of newFiles) {
        // Resize for display and storage (1920x1080)
        const resizedImage = await resizeImage(file, 1920, 1080);

        // Add to unified images for display
        setUnifiedImages((prev) => [
          ...prev,
          {
            id: `new-${Date.now()}`,
            url: URL.createObjectURL(resizedImage),
            type: "new" as const,
            originalData: resizedImage, // Store resized image as originalData
            order: prev.length,
            isLoading: false,
          },
        ]);

        // Store the resized image instead of original
        processedFiles.push(resizedImage);
      }

      // Update images array with resized files
      setImages([...images, ...processedFiles]);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resizeImage = async (
    file: File,
    maxWidth: number,
    maxHeight: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with high quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"));
              return;
            }
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          0.95 // High quality
        );
      };

      img.onerror = () => {
        reject(new Error("Error loading image"));
      };
    });
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
      // Remove all three versions (1920x1080, thumbnail, and original)
      newImages.splice(index, 3);
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
      {resizingImage && (
        <ImageResizer
          image={resizingImage.file}
          targetBucket={resizingImage.bucket}
          onResize={handleResizedImage}
          onCancel={() => setResizingImage(null)}
        />
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
                  handleDelete(index, originalImage.id);
                } else {
                  // Find the index in the images array
                  const imageIndex = images.findIndex(
                    (img) => img === image.originalData
                  );
                  if (imageIndex !== -1) {
                    handleDelete(imageIndex);
                  }
                }
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
        <p className="text-sm text-red-500 mt-1">
          Dikey video (Shorts) linkleri gösterilmemektedir.
        </p>
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
