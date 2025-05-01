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
import { OfficeWorker, PropertyDescriptorCategory, User } from "@prisma/client";

import axios from "axios";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface Props {
  prev: () => void;
  className?: string;
  agents: OfficeWorker[];
  role: string;
  user: User;
  // descriptorCategories: any[];
  dbDescriptors: any[];
}
const Contact = ({
  prev,
  className,
  agents,
  role,
  user,
  // descriptorCategories,
  dbDescriptors,
}: Props) => {
  const {
    register,
    formState: { errors },
    control,
    getValues,
    setValue,
  } = useFormContext<AddPropertyInputType>();

  const [agentId, setAgentId] = React.useState<number>(0);
  const [descriptors, setDescriptors] = React.useState<any[]>([]);

  const [descriptorCategories, setDescriptorCategories] = React.useState<any[]>(
    []
  );

  useEffect(() => {
    const values = getValues();
    if (values.agentId) {
      setAgentId(Number(values.agentId));
    }
  }, [getValues]);
  const typeId = getValues().typeId;
  useEffect(() => {
    const values = getValues();
    if (values.typeId) {
      fetchDescriptors(Number(values.typeId));
    }
  }, [typeId, getValues]);

  async function fetchDescriptors(typeId: number) {
    try {
      if (!typeId) return;

      const response = await axios.get(
        `/api/property/get-property-descriptor-categories/${typeId}`
      );
      setDescriptorCategories(response.data);
    } catch (error) {
      console.error("Error fetching descriptors:", error);
      console.error("Failed typeId:", typeId);
    }
  }

  const [selectedTypeId, setSelectedTypeId] = React.useState(typeId);

  const [descriptorsGrouped, setDescriptorsGrouped] = React.useState<
    Record<string, any[]>
  >({});

  const propertyDescriptors = getValues().propertyDescriptors;

  let descriptorsList: number[] = [];
  dbDescriptors?.forEach((descriptor) => {
    if (descriptor && descriptor.descriptorId) {
      descriptorsList.push(descriptor.descriptorId);
    }
  });

  // Debug
  // console.log("dbDescriptors:", dbDescriptors);
  // console.log("descriptorsList:", descriptorsList);

  // const { user } = useKindeBrowserClient();
  //console.log("user is qwdqwe:", user);
  const currentAgent = agents.find((agent) => agent.userId === user?.id);

  useEffect(() => {
    if (currentAgent) {
      setValue("agentId", currentAgent.id);
    }
  }, [currentAgent, setValue]);

  return (
    <Card className={cn("pb-2", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-2">
        {role == "office-workers" && (
          <Input
            type="hidden"
            {...register("agentId", {
              valueAsNumber: true,
              value: Number(currentAgent?.id),
            })}
            className="hidden"
          />
        )}
        {role == "site-admin" && (
          <Select
            {...register("agentId", { valueAsNumber: true })}
            errorMessage={errors.agentId?.message}
            isInvalid={!!errors.agentId}
            label="Gayrimenkul Danışmanı"
            selectionMode="single"
            name="agentId"
            {...(getValues().agentId
              ? {
                  defaultSelectedKeys: [getValues().agentId.toString()],
                }
              : {})}
            onChange={(e) => {
              setValue("agentId", Number(e.target.value));
            }}
          >
            {agents.map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
                textValue={`${item.name} ${item.surname}`}
              >
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
                              isSelected={
                                field.value ||
                                descriptorsList.includes(Number(descriptor.id))
                              }
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
