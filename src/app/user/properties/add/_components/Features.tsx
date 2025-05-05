import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  SelectItem,
  cn,
  Switch,
} from "@nextui-org/react";
import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";
import { PropertySubType } from "@prisma/client";

interface Props {
  next: () => void;
  prev: () => void;
  className?: string;
  subTypes: PropertySubType[];
}

const Features = (props: Props) => {
  const bedrooms = [
    { id: 1, value: "1+0" },
    { id: 2, value: "1+1" },
    { id: 3, value: "2+1" },
    { id: 4, value: "2+2" },
    { id: 5, value: "3+1" },
    { id: 6, value: "3+2" },
    { id: 7, value: "4+1" },
    { id: 8, value: "4+2" },
    { id: 9, value: "5+1" },
    { id: 10, value: "5+2" },
    { id: 11, value: "6+1" },
    { id: 12, value: "6+2" },
  ];
  const bathrooms = [
    { id: 1, value: "1" },
    { id: 2, value: "2" },
    { id: 3, value: "3" },
    { id: 4, value: "4" },
  ];
  const {
    register,
    formState: { errors },
    control,
    trigger,
    getValues,
    watch,
    setValue,
  } = useFormContext<AddPropertyInputType>();

  // Watch for subTypeId and typeId changes
  const subTypeId = watch("subTypeId");
  const typeId = watch("typeId");
  const isMustakilEv = Number(subTypeId) === 5;
  const isType3 = Number(typeId) === 3;

  // Set default values for floor and totalFloor if it's a Müstakil ev
  useEffect(() => {
    if (isMustakilEv) {
      setValue("propertyFeature.floor", 0);
      setValue("propertyFeature.totalFloor", 0);
    }
  }, [isMustakilEv, setValue]);

  const handleNext = async () => {
    // Always ensure floor values are set to 0 for Müstakil ev
    if (isMustakilEv) {
      setValue("propertyFeature.floor", 0);
      setValue("propertyFeature.totalFloor", 0);
    }

    // Define fields to validate based on type
    const fieldsToValidate = isType3
      ? [
          "propertyFeature.area" as const,
          "propertyFeature.parcelNumber" as const,
          "propertyFeature.blockNumber" as const,
        ]
      : [
          "propertyFeature.area" as const,
          "propertyFeature.bathrooms" as const,
          "propertyFeature.bedrooms" as const,
          "propertyFeature.floor" as const,
          "propertyFeature.totalFloor" as const,
        ];

    if (await trigger(fieldsToValidate)) {
      props.next();
    }
  };

  return (
    <Card className={cn("p-2 flex flex-col gap-4", props.className)}>
      <div className="flex lg:flex-row flex-col gap-4">
        <div className="lg:w-1/2 w-full flex flex-col gap-4">
          {!isType3 && (
            <>
              <Controller
                name="propertyFeature.bedrooms"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <Select
                    selectedKeys={value ? [value] : []}
                    onSelectionChange={(keys) => onChange(Array.from(keys)[0])}
                    errorMessage={errors.propertyFeature?.bedrooms?.message}
                    isInvalid={!!errors.propertyFeature?.bedrooms}
                    label="Oda sayısı"
                    selectionMode="single"
                  >
                    {bedrooms.map((item) => (
                      <SelectItem key={item.value} value={item.id}>
                        {item.value}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Select
                {...register("propertyFeature.bathrooms")}
                errorMessage={errors.propertyFeature?.bathrooms?.message}
                isInvalid={!!errors.propertyFeature?.bathrooms}
                label="Banyo Sayısı"
                selectionMode="single"
                name="propertyFeature.bathrooms"
                defaultSelectedKeys={
                  getValues().propertyFeature &&
                  getValues().propertyFeature.bathrooms
                    ? [getValues().propertyFeature.bathrooms]
                    : undefined
                }
              >
                {bathrooms.map((item) => (
                  <SelectItem key={item.id} value={item.value}>
                    {item.value}
                  </SelectItem>
                ))}
              </Select>
            </>
          )}
          <Input
            {...register("propertyFeature.area", { valueAsNumber: true })}
            errorMessage={errors.propertyFeature?.area?.message}
            isInvalid={!!errors.propertyFeature?.area}
            label="Net Alan (m²)"
            type="number"
            {...(getValues().propertyFeature && getValues().propertyFeature.area
              ? {
                  defaultValue: getValues().propertyFeature.area.toString(),
                }
              : {})}
          />
          <Input
            {...register("propertyFeature.grossArea", { valueAsNumber: true })}
            errorMessage={errors.propertyFeature?.grossArea?.message}
            isInvalid={!!errors.propertyFeature?.grossArea}
            label="Brüt Alan (m²)"
            type="number"
            {...(getValues().propertyFeature &&
            getValues().propertyFeature.grossArea
              ? {
                  defaultValue:
                    getValues().propertyFeature.grossArea.toString(),
                }
              : {})}
          />
        </div>
        <div className="lg:w-1/2 w-full flex flex-col gap-4">
          {!isMustakilEv && !isType3 && (
            <>
              <Input
                {...register("propertyFeature.floor", { valueAsNumber: true })}
                errorMessage={errors.propertyFeature?.floor?.message}
                isInvalid={!!errors.propertyFeature?.floor}
                label="Bulunduğu Kat"
                type="number"
                {...(getValues().propertyFeature &&
                getValues().propertyFeature.floor
                  ? {
                      defaultValue:
                        getValues().propertyFeature.floor.toString(),
                    }
                  : {})}
              />
              <Input
                {...register("propertyFeature.totalFloor", {
                  valueAsNumber: true,
                })}
                errorMessage={errors.propertyFeature?.totalFloor?.message}
                isInvalid={!!errors.propertyFeature?.totalFloor}
                label="Binadaki kat sayısı"
                type="number"
                {...(getValues().propertyFeature &&
                getValues().propertyFeature.totalFloor
                  ? {
                      defaultValue:
                        getValues().propertyFeature.totalFloor.toString(),
                    }
                  : {})}
              />
            </>
          )}
          <div className=" flex-col gap-4 hidden">
            <Controller
              name="propertyFeature.hasSwimmingPool"
              control={control}
              defaultValue={false}
              render={({ field: { onChange, value } }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={value}
                    onValueChange={onChange}
                    size="sm"
                  />
                  <span>Havuz</span>
                </div>
              )}
            />
            <Controller
              name="propertyFeature.hasGardenYard"
              control={control}
              defaultValue={false}
              render={({ field: { onChange, value } }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={value}
                    onValueChange={onChange}
                    size="sm"
                  />
                  <span>Bahçe</span>
                </div>
              )}
            />
            <Controller
              name="propertyFeature.hasBalcony"
              control={control}
              defaultValue={false}
              render={({ field: { onChange, value } }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={value}
                    onValueChange={onChange}
                    size="sm"
                  />
                  <span>Balkon</span>
                </div>
              )}
            />
          </div>
          {isType3 && (
            <>
              <Input
                {...register("propertyFeature.parcelNumber", {
                  valueAsNumber: true,
                })}
                errorMessage={errors.propertyFeature?.parcelNumber?.message}
                isInvalid={!!errors.propertyFeature?.parcelNumber}
                label="Parsel Numarası"
                type="number"
                {...(getValues().propertyFeature &&
                getValues().propertyFeature.parcelNumber !== undefined
                  ? {
                      defaultValue:
                        getValues().propertyFeature!.parcelNumber!.toString(),
                    }
                  : {})}
              />
              <Input
                {...register("propertyFeature.blockNumber", {
                  valueAsNumber: true,
                })}
                errorMessage={errors.propertyFeature?.blockNumber?.message}
                isInvalid={!!errors.propertyFeature?.blockNumber}
                label="Ada Numarası"
                type="number"
                {...(getValues().propertyFeature &&
                getValues().propertyFeature.blockNumber !== undefined
                  ? {
                      defaultValue:
                        getValues().propertyFeature!.blockNumber!.toString(),
                    }
                  : {})}
              />
              <Controller
                name="propertyFeature.zoningStatus"
                control={control}
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={value}
                      onValueChange={onChange}
                      size="sm"
                    />
                    <span>İmar Durumu</span>
                  </div>
                )}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center col-span-3 gap-3">
        <Button
          onClick={props.prev}
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

export default Features;
