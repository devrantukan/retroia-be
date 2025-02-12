import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  SelectItem,
  cn,
} from "@nextui-org/react";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";

interface Props {
  next: () => void;
  prev: () => void;
  className?: string;
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
  } = useFormContext<AddPropertyInputType>();
  const handleNext = async () => {
    if (
      await trigger([
        "propertyFeature.area",
        "propertyFeature.bathrooms",
        "propertyFeature.bedrooms",
        "propertyFeature.floor",
        "propertyFeature.totalFloor",
      ])
    )
      props.next();
  };
  return (
    <Card className={cn("p-2 ", props.className)}>
      <div className="flex flex-col  gap-y-4">
        <div className="flex lg:flex-row flex-col gap-4">
          <div className="lg:w-1/2 w-full flex flex-col gap-4 ">
            <Select
              {...register("propertyFeature.bedrooms", {
                setValueAs: (v: any) => v.toString(),
              })}
              errorMessage={errors.propertyFeature?.bedrooms?.message}
              isInvalid={!!errors.propertyFeature?.bedrooms}
              label="Oda sayısı"
              selectionMode="single"
              name="propertyFeature.bedrooms"
              {...(getValues().propertyFeature &&
              getValues().propertyFeature.bedrooms
                ? {
                    defaultSelectedKeys: [
                      bedrooms.find(
                        (b) => b.value === getValues().propertyFeature.bedrooms
                      )?.value || "",
                    ],
                  }
                : {})}
            >
              {bedrooms.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value}
                </SelectItem>
              ))}
            </Select>

            <Select
              {...register("propertyFeature.bathrooms", {
                setValueAs: (v: any) => v.toString(),
              })}
              errorMessage={errors.propertyFeature?.bathrooms?.message}
              isInvalid={!!errors.propertyFeature?.bathrooms}
              label="Banyo sayısı"
              selectionMode="single"
              name="propertyFeature.bathrooms"
              {...(getValues().propertyFeature &&
              getValues().propertyFeature.bathrooms
                ? {
                    defaultSelectedKeys: [
                      getValues().propertyFeature.bathrooms.toString(),
                    ],
                  }
                : {})}
            >
              {bathrooms.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.value}
                </SelectItem>
              ))}
            </Select>

            <Input
              {...register("propertyFeature.floor", { valueAsNumber: true })}
              errorMessage={errors.propertyFeature?.floor?.message}
              isInvalid={!!errors.propertyFeature?.floor}
              label="Bulunduğu Kat"
              {...(getValues().propertyFeature &&
              getValues().propertyFeature.floor
                ? {
                    defaultValue: getValues().propertyFeature.floor.toString(),
                  }
                : {})}
            />
          </div>
          <div className="lg:w-1/2 w-full flex flex-col gap-4 ">
            <Input
              {...register("propertyFeature.totalFloor", {
                valueAsNumber: true,
              })}
              errorMessage={errors.propertyFeature?.totalFloor?.message}
              isInvalid={!!errors.propertyFeature?.totalFloor}
              label="Binadaki kat sayısı"
              {...(getValues().propertyFeature &&
              getValues().propertyFeature.totalFloor
                ? {
                    defaultValue:
                      getValues().propertyFeature.totalFloor.toString(),
                  }
                : {})}
            />

            <Input
              {...register("propertyFeature.area", { valueAsNumber: true })}
              errorMessage={errors.propertyFeature?.area?.message}
              isInvalid={!!errors.propertyFeature?.area}
              label="Toplam alan (m2)"
              type="number"
              defaultValue={getValues().propertyFeature?.area?.toString()}
            />
          </div>
        </div>
        <div className="hidden">
          <Controller
            control={control}
            name="propertyFeature.hasSwimmingPool"
            render={({ field }) => (
              <Checkbox onChange={field.onChange} onBlur={field.onBlur}>
                Yüzme havuzu var
              </Checkbox>
            )}
          />

          <Controller
            control={control}
            name="propertyFeature.hasGardenYard"
            render={({ field }) => (
              <Checkbox onChange={field.onChange} onBlur={field.onBlur}>
                Bahçe var
              </Checkbox>
            )}
          />

          <Controller
            control={control}
            name="propertyFeature.hasBalcony"
            render={({ field }) => (
              <Checkbox onChange={field.onChange} onBlur={field.onBlur}>
                Balkon var
              </Checkbox>
            )}
          />
        </div>
        <div className="flex justify-center col-span-2 gap-3">
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
      </div>
    </Card>
  );
};
export default Features;
