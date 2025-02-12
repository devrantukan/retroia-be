"use client";
import React, { useState, useEffect } from "react";
import Stepper from "./Stepper";
import Basic from "./basic";
import {
  Prisma,
  Property,
  PropertyContract,
  PropertyImage,
  PropertyStatus,
  PropertyType,
  PropertySubType,
  OfficeWorker,
  Country,
  City,
  District,
  Neighborhood,
  PropertyDescriptorCategory,
} from "@prisma/client";
import { cn } from "@nextui-org/react";
import Location from "./Location";
import Features from "./Features";
import Picture from "./Picture";
import Contact from "./Contact";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { date, z } from "zod";
import { getAddPropertyFormSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadImages } from "@/lib/upload";
import {
  editProperty,
  saveProperty,
  managePropertyDescriptor,
} from "@/lib/actions/property";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { redirect, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "@nextui-org/react";

const steps = [
  {
    label: "Temel Bilgiler",
  },
  {
    label: "Konum",
  },
  {
    label: "Özellikler",
  },
  {
    label: "Medya",
  },
  {
    label: "Diğer",
  },
];

interface Props {
  types: PropertyType[];
  subTypes: PropertySubType[];
  contracts: PropertyContract[];
  statuses: PropertyStatus[];
  agents: OfficeWorker[];
  countries: Country[];
  cities: City[];
  citiesObj: Record<any, any[]>; // Add this line
  //  districtsObj: Record<any, any[]>;
  //  districts: District[];
  // neighborhoods: Neighborhood[];
  // neighborhoodsObj: Record<any, any[]>;
  property?: Prisma.PropertyGetPayload<{
    include: {
      location: true;
      agent: true;
      feature: true;
      images: true;
      descriptors: true;
    };
  }>;
  isEdit?: boolean;
  role: string;
  // descriptorCategories: PropertyDescriptorCategory[];
}

export type AddPropertyInputType = z.infer<
  Awaited<ReturnType<typeof getAddPropertyFormSchema>>
>;

const AddPropertyForm = ({ role, isEdit = false, ...props }: Props) => {
  const [dbDescriptors, SetDbDescriptors] = useState<Record<string, boolean>>(
    {}
  );

  const router = useRouter();
  const [schema, setSchema] = useState<z.ZodObject<any>>();

  const methods = useForm<AddPropertyInputType>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      location: props.property?.location ?? undefined,
      propertyFeature: props.property?.feature
        ? {
            bedrooms: props.property.feature.bedrooms,
            bathrooms: props.property.feature.bathrooms.toString(),
            floor: Number(props.property.feature.floor),
            totalFloor: Number(props.property.feature.totalFloor),
            area: Number(props.property.feature.area),
            hasSwimmingPool: props.property.feature.hasSwimmingPool,
            hasGardenYard: props.property.feature.hasGardenYard,
            hasBalcony: props.property.feature.hasBalcony,
          }
        : undefined,
      description: props.property?.description ?? undefined,
      name: props.property?.name ?? undefined,
      price: props.property?.price ?? undefined,
      discountedPrice: props.property?.discountedPrice?.toString(),
      statusId: props.property?.statusId ?? undefined,
      typeId: props.property?.typeId ?? undefined,
      subTypeId: props.property?.subTypeId ?? undefined,
      contractId: props.property?.contractId ?? undefined,
      agentId: props.property?.agentId ?? undefined,
      videoSource: props.property?.videoSource ?? undefined,
      threeDSource: props.property?.threeDSource ?? undefined,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [savedImagesUrl, setSavedImagesUrl] = useState<PropertyImage[]>(
    props.property?.images ?? []
  );

  const [step, setStep] = useState(0);

  const { user } = useKindeBrowserClient();
  const [dbUser, setDbUser] = useState<any>(null);

  const [existingImages, setExistingImages] = useState<PropertyImage[]>(
    props.property?.images || []
  );

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user");
      const data = await response.json();
      setDbUser(data);
    };

    if (user?.id) {
      fetchUser();
    }
  }, [user?.id]);

  useEffect(() => {
    async function loadSchema() {
      const formSchema = await getAddPropertyFormSchema();
      // console.log(formSchema);
      setSchema(formSchema);
    }
    loadSchema();
  }, []);

  const handleImages = async (
    newImages: string[],
    deletedImages?: number[]
  ) => {
    // Your image handling logic here
  };

  const onSubmit = async (data: AddPropertyInputType) => {
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      const formDataWithCoordinates = {
        ...data,
        location: {
          ...data.location,
          latitude: Number(data.location.latitude),
          longitude: Number(data.location.longitude),
        },
        existingImages,
        propertyDescriptors: data.propertyDescriptors,
      };

      if (isEdit && props.property) {
        await editProperty(
          props.property.id,
          formDataWithCoordinates,
          imageUrls,
          deletedImages
        );
      } else {
        await saveProperty(formDataWithCoordinates, imageUrls, user?.id || "");
      }

      toast.success(
        isEdit ? "İlan güncellendi!" : "İlan başarıyla oluşturuldu!"
      );
      // router.push("/user/properties");
      window.location.assign("/user/properties");
    } catch (error) {
      console.error(error);
      toast.error("Bir hata oluştu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schema) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Spinner size="lg" color="white" />
        </div>
      )}

      <Stepper
        className="m-2"
        items={steps}
        activeItem={step}
        setActiveItem={setStep}
      />
      <FormProvider {...methods}>
        <form
          className="mt-3 p-2"
          onSubmit={methods.handleSubmit(onSubmit, (errors) =>
            console.log({ errors })
          )}
        >
          <Basic
            className={cn({ hidden: step !== 0 })}
            next={() => setStep((prev) => prev + 1)}
            types={props.types}
            subTypes={props.subTypes}
            contracts={props.contracts}
            statuses={props.statuses}
          />
          <Location
            countries={props.countries}
            cities={props.cities}
            citiesObj={props.citiesObj}
            next={() => setStep((prev) => prev + 1)}
            prev={() => setStep((prev) => prev - 1)}
            className={cn({ hidden: step !== 1 })}
            isEdit={isEdit}
            propertyLocation={props.property?.location}
          />
          <Features
            next={() => setStep((prev) => prev + 1)}
            prev={() => setStep((prev) => prev - 1)}
            className={cn({ hidden: step !== 2 })}
          />
          <Contact
            role={role}
            user={dbUser}
            agents={props.agents}
            dbDescriptors={
              (props.property?.descriptors as PropertyDescriptor[]) ?? []
            }
            //  descriptorCategories={props.descriptorCategories}
            prev={() => setStep((prev) => prev - 1)}
            className={cn({ hidden: step !== 4 })}
          />

          <Picture
            className={cn({ hidden: step !== 3 })}
            images={images}
            setImages={setImages}
            deletedImages={deletedImages}
            setDeletedImages={setDeletedImages}
            existingImages={existingImages}
            setExistingImages={setExistingImages}
            next={() => setStep(step + 1)}
            prev={() => setStep(step - 1)}
          />
        </form>
      </FormProvider>
    </div>
  );
};
export default AddPropertyForm;
