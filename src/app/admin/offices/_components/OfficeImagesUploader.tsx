"use client";

import { Button } from "@nextui-org/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { uploadProjectImage } from "@/lib/utils";
import slugify from "slugify";
import { TrashIcon } from "@heroicons/react/16/solid";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/app/admin/projects/_components/StrictModeDroppable";

interface OfficeImageUploaderProps {
  currentImages: Array<{ id: number; url: string }>;
  onImagesUpload: (images: Array<{ id: number; url: string }>) => void;
  label?: string;
  projectName?: string;
}

export default function OfficeImagesUploader({
  currentImages = [],
  onImagesUpload,
  label,
  projectName,
}: OfficeImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] =
    useState<Array<{ id: number; url: string }>>(currentImages);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const slug = projectName
          ? slugify(projectName, { lower: true, strict: true })
          : "";
        const url = await uploadProjectImage(file, slug);
        return url;
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Ofis görseli yüklenirken bir hata oluştu");
        return null;
      }
    },
    [projectName]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || isDragging) return;

      try {
        setUploading(true);
        const uploadPromises = acceptedFiles.map(handleImageUpload);
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);

        if (validUrls.length > 0) {
          const newImages = validUrls.map((url) => ({
            id: Math.random(),
            url,
          }));
          const updatedImages = [...previewImages, ...newImages];
          setPreviewImages(updatedImages);
          onImagesUpload(updatedImages);
          toast.success(`${validUrls.length} ofis görseli başarıyla yüklendi!`);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Görseller yüklenirken bir hata oluştu");
      } finally {
        setUploading(false);
      }
    },
    [handleImageUpload, previewImages, onImagesUpload, isDragging]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
    noClick: isDragging,
    maxFiles: 10,
  });

  const handleRemoveImage = (index: number) => {
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
    onImagesUpload(newImages);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(previewImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPreviewImages(items);
    onImagesUpload(items);
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label || "Ofis Görselleri"}
      </label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isDragActive ? "border-primary" : "border-gray-300"}
          hover:border-primary transition-colors`}
      >
        <input {...getInputProps()} />

        {previewImages.length > 0 ? (
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
          >
            <StrictModeDroppable droppableId="images">
              {(
                provided: DroppableProvided,
                snapshot: DroppableStateSnapshot
              ) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {previewImages.map((image, index) => (
                    <Draggable
                      key={`${image.id}-${index}`}
                      draggableId={`${image.id}-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative group aspect-video ${
                            snapshot.isDragging ? "z-50" : ""
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={`Office image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Görselleri buraya bırakın"
                : "Görseller yüklemek için tıklayın veya sürükleyin"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
