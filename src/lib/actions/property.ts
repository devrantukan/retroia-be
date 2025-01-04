"use server";

import { AddPropertyInputType } from "@/app/user/properties/add/_components/AddPropertyForm";
import prisma from "../prisma";
import { Property } from "@prisma/client";
import { redirect } from "next/navigation";

export async function managePropertyDescriptor(descriptorId: number) {
  const descriptorDetails = await prisma.propertyDescriptor.findUnique({
    where: {
      id: descriptorId,
    },
  });
  if (descriptorDetails) {
    //  console.log("here", descriptorDetails.slug);
    return await descriptorDetails;
  }
  return null;
}
export async function manageDescriptorData(
  descriptorData: Record<string, any>,
  propertyId: number
) {
  let updateData: { propertyId: number; descriptorId: number }[] = [];

  const deletePropertyDescriptors =
    await prisma.descriptorsOnProperties.deleteMany({
      where: { propertyId: propertyId },
    });
  console.log(deletePropertyDescriptors);
  await Promise.all(
    Object.entries(descriptorData)
      .filter((data) => JSON.parse(data[1]) === true)

      .map(async ([key]) => {
        const descriptors = await prisma.propertyDescriptor.findMany({
          where: {
            slug: key,
          },
        });
        // console.log(descriptors);
        const descriptor = descriptors[0]; // Get the first descriptor if any
        updateData.push({
          propertyId: propertyId,
          descriptorId: descriptor?.id ?? 0,
        });
      })
  );
  console.log(updateData);
  return { updateData };
}
export async function saveProperty(
  propertyData: AddPropertyInputType,
  imagesUrls: string[],
  userId: string
) {
  const basic: Omit<Property, "id"> = {
    name: propertyData.name,
    description: propertyData.description,
    price: propertyData.price,
    discountedPrice: propertyData.discountedPrice
      ? Number(propertyData.discountedPrice)
      : 0,
    statusId: propertyData.statusId,
    typeId: propertyData.typeId,

    subTypeId: propertyData.subTypeId ?? 0,
    contractId: propertyData.contractId,
    userId: userId,
    agentId: propertyData.agentId ?? 0,

    videoSource: propertyData.videoSource ?? "",
    threeDSource: propertyData.threeDSource ?? "",
  };
  const result = await prisma.property.create({
    data: {
      ...basic,
      location: {
        create: {
          streetAddress: propertyData.location.streetAddress,
          city: propertyData.location.city,
          district: propertyData.location.district,
          neighborhood: propertyData.location.neighborhood,
          country: propertyData.location.country,
          zip: propertyData.location.zip ?? "",
          state: propertyData.location.state ?? "",
          latitude: propertyData.location.latitude ?? 0,
          longitude: propertyData.location.longitude ?? 0,
          landmark: "",
          region: "",
        },
      },
      feature: {
        create: propertyData.propertyFeature,
      },

      // contact: {
      //   create: propertyData.contact,
      // },
      userId: userId,
      images: {
        create: imagesUrls.map((img) => ({
          url: img,
        })),
      },
    },
  });
  console.log({ result });
  return result;
}
export async function editProperty(
  propertyId: number,
  propertyData: AddPropertyInputType,
  newImagesUrls: string[],
  deletedImageIDs: number[]
) {
  //console.log(propertyData.propertyDescriptors);

  const result = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: {
      name: propertyData.name,
      price: propertyData.price,
      discountedPrice: propertyData.discountedPrice
        ? Number(propertyData.discountedPrice)
        : undefined,
      typeId: propertyData.typeId,
      subTypeId: propertyData.subTypeId,
      contractId: propertyData.contractId,
      description: propertyData.description,
      statusId: propertyData.statusId,
      agentId: propertyData.agentId,
      videoSource: propertyData.videoSource,
      threeDSource: propertyData.threeDSource,

      feature: {
        update: {
          ...propertyData.propertyFeature,
        },
      },
      location: {
        update: {
          ...propertyData.location,
        },
      },
      descriptors: {
        deleteMany: {},
        create: (
          await manageDescriptorData(
            propertyData.propertyDescriptors,
            propertyId
          )
        ).updateData.map(({ descriptorId }) => ({
          descriptorId,
        })),
      },
      images: {
        create: newImagesUrls.map((img) => ({
          url: img,
        })),
        deleteMany: {
          id: { in: deletedImageIDs },
        },
      },
    },
  });

  // console.log({ result });
  return result;
}
export async function deleteProperty(id: number) {
  const result = await prisma.property.delete({
    where: {
      id,
    },
  });
  return result;
}
