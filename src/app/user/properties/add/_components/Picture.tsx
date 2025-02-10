"use client";
import FileInput from "@/app/components/fileUpload";
import { Button, Card, cn, Input } from "@nextui-org/react";
import React, { useCallback } from "react";
import PictureCard from "./PictureCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { PropertyImage } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";

interface Props {
  next: () => void;
  prev: () => void;
  className?: string;
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  savedImagesUrl?: PropertyImage[];
  setSavedImageUrl?: React.Dispatch<React.SetStateAction<PropertyImage[]>>;
}

const Picture = ({
  setSavedImageUrl,
  savedImagesUrl,
  setImages,
  images,
  className,
  next,
  prev,
}: Props) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext<AddPropertyInputType>();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setImages((prev) => [...files, ...prev]);
    },
    [setImages]
  );

  const handleDelete = useCallback(
    (index: number) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
    },
    [setImages]
  );

  const handleSavedDelete = useCallback(
    (id: number) => {
      setSavedImageUrl?.((prev) => prev.filter((img) => img.id !== id));
    },
    [setSavedImageUrl]
  );

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      setImages((prev) => {
        const newImages = [...prev];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        return newImages;
      });
    },
    [setImages]
  );

  const moveSavedImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      setSavedImageUrl?.((prev) => {
        const newImages = [...prev];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        return newImages;
      });
    },
    [setSavedImageUrl]
  );

  return (
    <Card className={cn("p-3", className)}>
      <FileInput multiple={true} onSelect={handleFileSelect} />

      <div className="flex gap-3 flex-wrap mt-8 mb-4 justify-center">
        {savedImagesUrl?.map((image, index) => (
          <PictureCard
            key={image.id}
            src={image.url}
            index={index}
            onDelete={() => handleSavedDelete(Number(image.id))}
            onMoveLeft={
              index > 0 ? () => moveSavedImage(index, index - 1) : undefined
            }
            onMoveRight={
              index < savedImagesUrl.length - 1
                ? () => moveSavedImage(index, index + 1)
                : undefined
            }
          />
        ))}

        {images.map((image, index) => (
          <PictureCard
            key={index}
            src={URL.createObjectURL(image)}
            index={index}
            onDelete={() => handleDelete(index)}
            onMoveLeft={
              index > 0 ? () => moveImage(index, index - 1) : undefined
            }
            onMoveRight={
              index < images.length - 1
                ? () => moveImage(index, index + 1)
                : undefined
            }
          />
        ))}
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
