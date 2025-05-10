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
import { StrictModeDroppable } from "./StrictModeDroppable";

interface Props {
  currentImages?: { url: string; order: number }[];
  onImagesUpload: (images: { url: string; order: number }[]) => void;
  label?: string;
  projectName?: string;
}

export default function ProjectImagesUploader({
  currentImages = [],
  onImagesUpload,
  label,
  projectName,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        const urls = await Promise.all(
          acceptedFiles.map(async (file) => {
            const url = await uploadProjectImage(file, projectName);
            return url;
          })
        );

        const newImages = [
          ...currentImages,
          ...urls.map((url, index) => ({
            url,
            order: currentImages.length + index,
          })),
        ];
        onImagesUpload(newImages);
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Görsel yüklenirken bir hata oluştu");
      } finally {
        setUploading(false);
      }
    },
    [currentImages, onImagesUpload, projectName]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages
      .filter((_, i) => i !== index)
      .map((img, i) => ({
        ...img,
        order: i,
      }));
    onImagesUpload(newImages);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(currentImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedImages = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    onImagesUpload(reorderedImages);
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="images" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-nowrap overflow-x-auto gap-4 pb-4"
            >
              {currentImages.map((image, index) => (
                <Draggable
                  key={image.url}
                  draggableId={image.url}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative aspect-[16/9] w-[300px] flex-shrink-0 ${
                        snapshot.isDragging ? "z-50" : ""
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging
                          ? provided.draggableProps.style?.transform
                          : "none",
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={`Project image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
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

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isDragActive ? "border-primary" : "border-gray-300"}
          hover:border-primary transition-colors`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Görselleri buraya bırakın"
            : "Görsel yüklemek için tıklayın veya sürükleyin"}
        </p>
        <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 5MB)</p>
      </div>
    </div>
  );
}
