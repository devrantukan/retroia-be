import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/16/solid";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  SelectItem,
  cn,
} from "@nextui-org/react";
import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";
import { OfficeWorker, PropertyDescriptorCategory } from "@prisma/client";

import axios from "axios";

interface Props {
  prev: () => void;
  className?: string;
  agents: OfficeWorker[];
  role: string;
  descriptorCategories: any[];
  dbDescriptors: any[];
}
const Contact = ({
  prev,
  className,
  agents,
  role,
  descriptorCategories,
  dbDescriptors,
}: Props) => {
  const {
    register,
    formState: { errors },
    control,
    getValues,
  } = useFormContext<AddPropertyInputType>();
  const [selectedTypeId, setSelectedTypeId] = React.useState(0);

  const [descriptorsGrouped, setDescriptorsGrouped] = React.useState<
    Record<string, any[]>
  >({});

  const typeId = getValues().typeId;

  const propertyDescriptors = getValues().propertyDescriptors;

  console.log("pd", propertyDescriptors);

  const [descriptors, setDescriptors] = React.useState<any[]>([]);

  console.log("dd desc", dbDescriptors);

  let descriptorsList: number[] = [];
  dbDescriptors.forEach((key) => {
    descriptorsList.push(key.descriptorId);
  });

  console.log("list", descriptorsList);

  return (
    <Card className={cn("", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-2 ">
        {role == "office-workers" && (
          <Input
            {...register("agentId")}
            errorMessage={errors.agentId?.message}
            isInvalid={!!errors.agentId}
            label="Agent ID"
            defaultValue={String(getValues("agentId"))}
            className="w-full"
          />
        )}
        {role == "site-admin" && (
          <Select
            {...register("agentId", { setValueAs: (v: any) => v.toString() })}
            errorMessage={errors.agentId?.message}
            isInvalid={!!errors.agentId}
            label="Gayrimenkul Danışmanı"
            selectionMode="single"
            name="agentId"
            {...(getValues().agentId
              ? { defaultSelectedKeys: [getValues().agentId.toString()] }
              : {})}
          >
            {agents.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} {item.surname}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
      {descriptorCategories &&
        descriptorCategories
          .filter((descriptorCategory) => descriptorCategory.typeId == typeId)
          .map((descriptorCategory) => (
            <div key={descriptorCategory.id} className="p-4">
              <h2>{descriptorCategory.value}</h2>
              {descriptorCategory.descriptors &&
                descriptorCategory.descriptors.map(
                  (descriptor: {
                    id: string | number;
                    value: string;
                    slug: string;
                  }) => (
                    <div key={descriptor.id}>
                      <Controller
                        control={control}
                        name={`propertyDescriptors.${descriptor.slug}` as any}
                        defaultValue={descriptorsList.includes(
                          Number(descriptor.id)
                        )}
                        render={({ field }) => (
                          <Checkbox
                            id={String(descriptor.id)}
                            {...field}
                            value={descriptor.slug}
                            isSelected={field.value}
                            onValueChange={field.onChange}
                          >
                            {descriptor.value}
                          </Checkbox>
                        )}
                      />
                    </div>
                  )
                )}
            </div>
          ))}

      <div className="flex justify-center col-span-3 gap-3">
        <Button
          onClick={prev}
          startContent={<ChevronLeftIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          Geri
        </Button>
        <Button
          endContent={<PlusCircleIcon className="w-6" />}
          color="secondary"
          className="w-36"
          type="submit"
        >
          Kaydet
        </Button>
      </div>
    </Card>
  );
};
export default Contact;
