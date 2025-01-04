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
  // descriptorCategories: any[];
  dbDescriptors: any[];
}
const Contact = ({
  prev,
  className,
  agents,
  role,
  // descriptorCategories,
  dbDescriptors,
}: Props) => {
  const {
    register,
    formState: { errors },
    control,
    getValues,
  } = useFormContext<AddPropertyInputType>();

  const [agentId, setAgentId] = React.useState<number>(0);
  const [descriptors, setDescriptors] = React.useState<any[]>([]);

  const [descriptorCategories, setDescriptorCategories] = React.useState<any[]>(
    []
  );

  // console.log("dc cat", descriptorCategories);
  useEffect(() => {
    const values = getValues();
    if (values.agentId) {
      setAgentId(values.agentId);
    }
  }, [getValues]);

  useEffect(() => {
    const values = getValues();

    fetchDescriptors(values.typeId);
  }, [getValues]);

  async function fetchDescriptors(typeId: number) {
    try {
      const response = await axios.get(
        `/api/property/get-property-descriptor-categories/${typeId}`
      );
      setDescriptorCategories(response.data);
    } catch (error) {
      console.error("Error fetching descriptors:", error);
    }
  }
  const typeId = getValues().typeId;
  const [selectedTypeId, setSelectedTypeId] = React.useState(typeId);

  const [descriptorsGrouped, setDescriptorsGrouped] = React.useState<
    Record<string, any[]>
  >({});

  console.log(typeId);

  const propertyDescriptors = getValues().propertyDescriptors;

  //console.log("pd", propertyDescriptors);

  //console.log("dd desc", dbDescriptors);

  let descriptorsList: number[] = [];
  dbDescriptors.forEach((key) => {
    descriptorsList.push(key.descriptorId);
  });

  //console.log("list", descriptorsList);

  return (
    <Card className={cn("pb-2", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-2">
        {role == "office-workers" && (
          <Input
            {...register("agentId", {
              valueAsNumber: true,
            })}
            errorMessage={errors.agentId?.message}
            isInvalid={!!errors.agentId}
            label="Agent ID"
            className="w-full"
            {...(getValues().agentId
              ? {
                  defaultValue: getValues().agentId.toString(),
                }
              : {})}
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
      <div className="flex lg:flex-row flex-col basis-4">
        {descriptorCategories &&
          descriptorCategories
            .filter((descriptorCategory) => descriptorCategory.typeId == typeId)
            .map((descriptorCategory) => (
              <div key={descriptorCategory.id} className="p-4 ">
                <h2 className="text-lg font-semibold mb-4">
                  {descriptorCategory.value}
                </h2>
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
      </div>

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
