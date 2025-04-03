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
  currentImages?: string[];
  onImagesUpload: (urls: string[]) => void;
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
  const [previewUrls, setPreviewUrls] = useState<string[]>(currentImages);
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
        toast.error("Proje görseli yüklenirken bir hata oluştu");
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
          const newUrls = [...previewUrls, ...validUrls];
          setPreviewUrls(newUrls);
          onImagesUpload(newUrls);
          toast.success(
            `${validUrls.length} proje görseli başarıyla yüklendi!`
          );
        }
      } finally {
        setUploading(false);
      }
    },
    [handleImageUpload, previewUrls, onImagesUpload, isDragging]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
    noClick: isDragging,
  });

  const handleRemoveImage = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    onImagesUpload(newUrls);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(previewUrls);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPreviewUrls(items);
    onImagesUpload(items);
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label || "Proje Görselleri"}
      </label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isDragActive ? "border-primary" : "border-gray-300"}
          hover:border-primary transition-colors`}
      >
        <input {...getInputProps()} />

        {previewUrls.length > 0 ? (
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
          >
            <StrictModeDroppable droppableId="images" direction="horizontal">
              {(
                provided: DroppableProvided,
                snapshot: DroppableStateSnapshot
              ) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {previewUrls.map((url, index) => (
                    <Draggable key={url} draggableId={url} index={index}>
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
                            src={url}
                            alt={`Project image ${index + 1}`}
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
