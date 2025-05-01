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
  PropertyDeedStatus,
} from "@prisma/client";
import React, { useEffect } from "react";
import { useForm, useFormContext, useFormState } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";
import { format } from "path";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface Props {
  className?: string;
  types: PropertyType[];

  subTypes: PropertySubType[];
  contracts: PropertyContract[];
  statuses: PropertyStatus[];
  deedStatuses: PropertyDeedStatus[];
  next: () => void;
}
const Basic = (props: Props) => {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
  } = useFormContext<AddPropertyInputType>();

  const [typeId, setTypeId] = React.useState<number | undefined>(undefined);
  const [subTypeId, setSubTypeId] = React.useState<number | undefined>(
    getValues().subTypeId
  );
  const [description, setDescription] = React.useState("");

  // Watch for changes in contractId and subTypeId
  const contractId = watch("contractId");
  const currentSubTypeId = watch("subTypeId");
  const isSatilik =
    props.contracts.find((c) => c.slug === "satilik")?.id ===
    Number(contractId);
  const isMustakilEv =
    props.subTypes.find((st) => st.id === Number(currentSubTypeId))?.value ===
    "Müstakil ev";

  useEffect(() => {
    const values = getValues();
    if (values.typeId) {
      setTypeId(values.typeId);
    }

    if (values.subTypeId) {
      setValue("subTypeId", values.subTypeId);
      setSubTypeId(values.subTypeId);
    }
    if (values.description) {
      setDescription(values.description);
    }

    // Set default values for floor and totalFloor if it's a Müstakil ev
    if (isMustakilEv) {
      setValue("propertyFeature.floor", 0);
      setValue("propertyFeature.totalFloor", 0);
    }

    // Set default deedStatusId for rental properties
    if (!isSatilik && props.deedStatuses.length > 0) {
      setValue("deedStatusId", 8);
    }
  }, [getValues, setValue, isMustakilEv, isSatilik, props.deedStatuses]);

  //console.log("tid", typeId);
  //console.log("stid", subTypeId);
  //console.log("gvid", getValues().subTypeId);
  const handleNext = async () => {
    const values = getValues();
    console.log("Form values:", values);
    console.log("Form errors:", errors);

    if (
      await trigger([
        "name",
        "description",
        "typeId",
        "subTypeId",
        "contractId",
        "statusId",
        "deedStatusId",
        "price",
        "discountedPrice",
      ])
    )
      props.next();
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTypeId = Number(event.target.value);
    setTypeId(newTypeId);
    setValue("typeId", newTypeId);
  };

  const handleSubTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubTypeId = Number(event.target.value);
    setSubTypeId(newSubTypeId);
    setValue("subTypeId", newSubTypeId);
  };

  const onEditorStateChange = (description: string) => {
    setDescription(description);
    setValue("description", description);
  };

  const formatNumber = (value: string) => {
    // Remove any non-digit characters
    const number = value.replace(/\D/g, "");
    // Format with thousands separator
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (value: string) => {
    const formattedValue = formatNumber(value);
    setValue("price", parseInt(value.replace(/\D/g, "")) || 0); // Convert to number, default to 0
    return formattedValue;
  };

  const handleDiscountedPriceChange = (value: string) => {
    const formattedValue = formatNumber(value);
    setValue("discountedPrice", value.replace(/\D/g, "") || "0"); // Convert to string, default to "0"
    return formattedValue;
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
          label="Hizmet Tipi"
          selectionMode="single"
          name="contractId"
          defaultSelectedKeys={
            getValues().contractId
              ? [getValues().contractId.toString()]
              : undefined
          }
        >
          {props.contracts.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
        </Select>

        {isSatilik && (
          <Select
            {...register("deedStatusId", {
              setValueAs: (v: any) => v.toString(),
            })}
            errorMessage={errors.deedStatusId?.message}
            isInvalid={!!errors.deedStatusId}
            label="Tapu Durumu"
            selectionMode="single"
            name="deedStatusId"
            defaultSelectedKeys={
              getValues().deedStatusId
                ? [getValues().deedStatusId.toString()]
                : undefined
            }
          >
            {props.deedStatuses.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.value}
              </SelectItem>
            ))}
          </Select>
        )}

        <Select
          {...register("typeId", { setValueAs: (v: any) => v.toString() })}
          errorMessage={errors.typeId?.message}
          isInvalid={!!errors.typeId}
          label="Gayrimenkul Tipi"
          selectionMode="single"
          name="typeId"
          value={typeId?.toString()}
          onChange={handleTypeChange}
          defaultSelectedKeys={
            getValues().typeId ? [getValues().typeId.toString()] : undefined
          }
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
          value={subTypeId?.toString()}
          onChange={handleSubTypeChange}
          defaultSelectedKeys={
            getValues().subTypeId
              ? [getValues().subTypeId.toString()]
              : undefined
          }
        >
          {props.subTypes
            .filter((item) => item.typeId == getValues().typeId)
            .map((item) => (
              <SelectItem key={item.id} value={item.value}>
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
          label="Kontrat Tipi"
          selectionMode="single"
          name="statusId"
          defaultSelectedKeys={
            getValues().statusId ? [getValues().statusId.toString()] : undefined
          }
        >
          {props.statuses.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
        </Select>
        <Input
          {...register("discountedPrice", {
            setValueAs: (v: any) => v.toString(),
          })}
          errorMessage={errors.discountedPrice?.message}
          isInvalid={!!errors.discountedPrice}
          label="İndirimli Fiyat"
          name="discountedPrice"
          defaultValue={
            getValues().discountedPrice
              ? formatNumber(getValues().discountedPrice ?? "")
              : ""
          }
          onValueChange={handleDiscountedPriceChange}
        />
        <Input
          {...register("price", {
            setValueAs: (v: any) => v.toString(),
          })}
          errorMessage={errors.price?.message}
          isInvalid={!!errors.price}
          label="Fiyat"
          name="price"
          defaultValue={formatNumber(getValues().price?.toString() || "")}
          onValueChange={handlePriceChange}
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
