import FileInput from "@/app/components/fileUpload";
import { Button, Card, cn, Input } from "@nextui-org/react";
import React from "react";
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
  setImages: (images: File[]) => void;
  savedImagesUrl?: PropertyImage[];
  setSavedImageUrl?: (propertyImages: PropertyImage[]) => void;
}

const Picture = (props: Props) => {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useFormContext<AddPropertyInputType>();
  return (
    <Card className={cn("p-3", props.className)}>
      <FileInput
        multiple={true}
        onSelect={(e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          props.setImages([...files, ...props.images]);
        }}
      />
      <div className="flex gap-3 flex-wrap">
        {props.savedImagesUrl!! &&
          props.setSavedImageUrl!! &&
          props.savedImagesUrl.map((image, index) => {
            return (
              <PictureCard
                key={image.id}
                src={image.url}
                index={index}
                onDelete={(i) =>
                  props.setSavedImageUrl!! &&
                  props.setSavedImageUrl(
                    props.savedImagesUrl!.filter((img) => img.id !== image.id)
                  )
                }
              />
            );
          })}

        {props.images.map((image, index) => {
          const srcUrl = URL.createObjectURL(image);
          return (
            <PictureCard
              key={srcUrl}
              src={srcUrl}
              index={index}
              onDelete={(i) =>
                props.setImages([
                  ...props.images.slice(0, i),
                  ...props.images.slice(i + 1),
                ])
              }
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-y-4">
        <Input
          {...register("videoSource", {
            setValueAs: (v: any) => v.toString(),
          })}
          errorMessage={errors.videoSource?.message}
          isInvalid={!!errors.videoSource}
          label="Video Url"
          name="videoSource"
          {...(getValues().videoSource
            ? { defaultValue: getValues().videoSource }
            : {})}
        />
        <Input
          {...register("threeDSource", {
            setValueAs: (v: any) => v.toString(),
          })}
          errorMessage={errors.threeDSource?.message}
          isInvalid={!!errors.threeDSource}
          label="3d Url "
          name="threeDSource"
          {...(getValues().threeDSource
            ? { defaultValue: getValues().threeDSource }
            : {})}
        />
      </div>
      <div className="flex justify-center col-span-2 gap-3 mt-3">
        <Button
          onClick={props.prev}
          startContent={<ChevronLeftIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          Geri
        </Button>
        <Button
          onClick={props.next}
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
