"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Textarea,
  cn,
} from "@nextui-org/react";
import {
  PropertyStatus,
  PropertyType,
  PropertySubType,
  PropertyContract,
} from "@prisma/client";
import React, { useEffect } from "react";
import { useForm, useFormContext, useFormState } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";
import { format } from "path";
import RichTextEditor from "@/app/components/RichTextEditor";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface Props {
  className?: string;
  types: PropertyType[];

  subTypes: PropertySubType[];
  contracts: PropertyContract[];
  statuses: PropertyStatus[];
  next: () => void;
}
const Basic = (props: Props) => {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useFormContext<AddPropertyInputType>();

  const [typeId, setTypeId] = React.useState(0);
  const [description, setDescription] = React.useState("");

  //console.log("executed");
  useEffect(() => {
    if (getValues().typeId) {
      //   console.log("use effect called");
      setTypeId(getValues().typeId);
    }
    if (getValues().description) {
      //  console.log("use effect called");
      setDescription(getValues().description);
    }
  }, [getValues]);

  // console.log("getvalues", getValues().description);
  // console.log("typeId is:", typeId);

  const handleNext = async () => {
    if (
      await trigger([
        "name",
        "description",
        "typeId",
        "subTypeId",
        "contractId",
        "statusId",
        "price",
      ])
    )
      props.next();
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTypeId = Number(event.target.value);
    setTypeId(newTypeId);
    setValue("typeId", newTypeId);
  };

  const onEditorStateChange = (description: string) => {
    setDescription(description);
    setValue("description", description);
  };

  return (
    <Card className={cn("p-2 flex flex-col gap-4", props.className)}>
      <Input
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
        label="Başlık"
        className=""
        name="name"
        defaultValue={getValues().name}
      />

      {/* <RichTextEditor defaultValue={getValues().description} /> */}
      <div className="w-full  h-[460px] p-2 bg-gray-100 rounded-xl">
        <p className="text-xs mb-1">Detaylı Bilgi</p>
        <ReactQuill
          modules={{
            toolbar: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["link", "image"],
              ["clean"],
            ],
          }}
          className="h-[380px] rounded-lg border-gray-200"
          theme="snow"
          value={description}
          onChange={onEditorStateChange}
        />
      </div>

      <Textarea
        {...register("description")}
        errorMessage={errors.description?.message}
        isInvalid={!!errors.description}
        label="Detaylı Bilgi"
        className=" hidden"
        name="description"
        defaultValue={getValues().description}
        value={description}
        onValueChange={onEditorStateChange}
      />
      <div className="flex lg:flex-row flex-col gap-4 ">
        <Select
          {...register("contractId", { setValueAs: (v: any) => v.toString() })}
          errorMessage={errors.contractId?.message}
          isInvalid={!!errors.contractId}
          label="Kontrat Tipi"
          selectionMode="single"
          name="contractId"
          {...(getValues().contractId
            ? { defaultSelectedKeys: [getValues().contractId.toString()] }
            : {})}
        >
          {props.contracts.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
        </Select>

        <Select
          {...register("typeId", { setValueAs: (v: any) => v.toString() })}
          errorMessage={errors.typeId?.message}
          isInvalid={!!errors.typeId}
          label="Gayrimenkul Tipi"
          selectionMode="single"
          name="typeId"
          value={typeId}
          onChange={handleTypeChange}
          {...(getValues().typeId
            ? { defaultSelectedKeys: [getValues().typeId.toString()] }
            : {})}
        >
          {props.types.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
        </Select>
        <Select
          {...register("subTypeId", { setValueAs: (v: any) => v.toString() })}
          errorMessage={errors.subTypeId?.message}
          isInvalid={!!errors.subTypeId}
          label="Gayrimenkul Alt Tipi"
          selectionMode="single"
          name="subTypeId"
          disabled={!typeId}
          {...(getValues().subTypeId
            ? { defaultSelectedKeys: [getValues().subTypeId.toString()] }
            : {})}
        >
          {props.subTypes
            .filter((item) => item.typeId == typeId)
            .map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.value}
              </SelectItem>
            ))}
        </Select>
      </div>
      <div className="flex lg:flex-row flex-col gap-4 ">
        <Select
          {...register("statusId", { setValueAs: (v: any) => v.toString() })}
          errorMessage={errors.statusId?.message}
          isInvalid={!!errors.statusId}
          label="Durum"
          selectionMode="single"
          name="statusId"
          {...(getValues().statusId
            ? { defaultSelectedKeys: [getValues().statusId.toString()] }
            : {})}
        >
          {props.statuses.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
        </Select>

        <Input
          {...register("price", { setValueAs: (v: any) => v.toString() })}
          errorMessage={errors.price?.message}
          isInvalid={!!errors.price}
          label="Fiyat"
          name="price"
          {...(getValues().price
            ? { defaultValue: getValues().price.toString() }
            : {})}
        />
      </div>
      <div className="flex justify-center col-span-3 gap-3">
        <Button
          isDisabled
          startContent={<ChevronLeftIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          Geri
        </Button>
        <Button
          onClick={handleNext}
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
export default Basic;
