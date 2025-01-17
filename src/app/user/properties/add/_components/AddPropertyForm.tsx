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
import { AddPropertyFormSchema } from "@/lib/zodSchema";
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

export type AddPropertyInputType = z.infer<typeof AddPropertyFormSchema>;

const AddPropertyForm = ({ role, isEdit = false, ...props }: Props) => {
  const [dbDescriptors, SetDbDescriptors] = useState<Record<string, boolean>>(
    {}
  );

  const router = useRouter();
  const methods = useForm<AddPropertyInputType>({
    resolver: zodResolver(AddPropertyFormSchema),
    defaultValues: {
      location: props.property?.location ?? undefined,
      propertyFeature: props.property?.feature ?? undefined,
      description: props.property?.description ?? undefined,
      name: props.property?.name ?? undefined,
      price: props.property?.price ?? undefined,
      discountedPrice: props.property?.discountedPrice.toString(),
      statusId: props.property?.statusId ?? undefined,
      typeId: props.property?.typeId ?? undefined,
      subTypeId: props.property?.subTypeId ?? undefined,
      contractId: props.property?.contractId ?? undefined,
      agentId: props.property?.agentId ?? undefined,
      videoSource: props.property?.videoSource ?? undefined,
      threeDSource: props.property?.threeDSource ?? undefined,
      // propertyDescriptors:
      //   props.property?.descriptors?.reduce((acc, descriptor) => {
      //     const descriptorDetails = managePropertyDescriptor(
      //       descriptor.descriptorId
      //     );

      //     descriptorDetails.then((details) => {
      //       if (details) {
      //         acc[details.slug] = true;
      //       }
      //     });

      //     return acc;
      //   }, {} as Record<string, boolean>) ?? undefined,
    },
  });

  const [images, setImages] = useState<File[]>([]);

  const [savedImagesUrl, setSavedImagesUrl] = useState<PropertyImage[]>(
    props.property?.images ?? []
  );

  const [step, setStep] = useState(0);

  const { user } = useKindeBrowserClient();
  const [dbUser, setDbUser] = useState<any>(null);

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

  const handleImages = async (
    newImages: string[],
    deletedImages?: number[]
  ) => {
    // Your image handling logic here
  };

  const onSubmit: SubmitHandler<AddPropertyInputType> = async (data) => {
    console.log("Form data:", data);
    const imageUrls = await uploadImages(images);

    try {
      // Convert propertyDescriptors to the format expected by the API
      const descriptors = Object.entries(data.propertyDescriptors || {})
        .filter(([_, value]) => value === true)
        .map(([key]) => ({
          [key]: true,
        }));

      // console.log("Processed descriptors:", descriptors);

      const formDataWithDescriptors = {
        ...data,
        propertyDescriptors: Object.assign({}, ...descriptors),
      };

      if (isEdit && props.property) {
        const deletedImageIDs = props.property?.images
          .filter((item) => !savedImagesUrl.includes(item))
          .map((item) => item.id);

        const formDataWithCoordinates = {
          ...formDataWithDescriptors,
          location: {
            ...formDataWithDescriptors.location,
            latitude: Number(formDataWithDescriptors.location.latitude),
            longitude: Number(formDataWithDescriptors.location.longitude),
          },
        };

        await editProperty(Number(props.property.id), formDataWithCoordinates);
        await handleImages(imageUrls, deletedImageIDs);
        toast.success("İlan Güncellendi!");
      } else {
        await saveProperty(formDataWithDescriptors, imageUrls, user?.id!);
        toast.success("İlan Eklendi!");
      }
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Bir hata oluştu!");
    } finally {
      window.location.assign("/user/properties");
      //   router.push("/user/properties");
    }
  };
  return (
    <div>
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
            //districtsObj={props.districtsObj}
            //districts={props.districts}
            // neighborhoods={props.neighborhoods}
            // neighborhoodsObj={props.neighborhoodsObj}
            next={() => setStep((prev) => prev + 1)}
            prev={() => setStep((prev) => prev - 1)}
            className={cn({ hidden: step !== 1 })}
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
            next={() => setStep((prev) => prev + 1)}
            prev={() => setStep((prev) => prev - 1)}
            className={cn({ hidden: step !== 3 })}
            images={images}
            setImages={setImages}
            {...(props.property && {
              savedImagesUrl: savedImagesUrl,
              setSavedImageUrl: setSavedImagesUrl,
            })}
          />
        </form>
      </FormProvider>
    </div>
  );
};
export default AddPropertyForm;
