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
    publishingStatus: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const descriptorData = await manageDescriptorData(
    propertyData.propertyDescriptors,
    0 // Temporary ID, will be replaced with the actual property ID
  );

  const result = await prisma.property.create({
    data: {
      ...basic,
      location: {
        create: {
          city: propertyData.location.city,
          country: propertyData.location.country,
          district: propertyData.location.district,
          neighborhood: propertyData.location.neighborhood,
          streetAddress: propertyData.location.streetAddress,
          state: propertyData.location.state ?? "",
          zip: propertyData.location.zip ?? "",
          region: propertyData.location.region ?? "",
          landmark: propertyData.location.landmark ?? "",
          latitude: propertyData.location.latitude ?? 0,
          longitude: propertyData.location.longitude ?? 0,
        },
      },
      feature: {
        create: propertyData.propertyFeature,
      },
      descriptors: {
        create: descriptorData.updateData.map(({ descriptorId }) => ({
          descriptorId,
        })),
      },
      userId: userId,
      images: {
        create: imagesUrls.map((img) => ({
          url: img,
        })),
      },
    },
  });

  // Update descriptors with the actual property ID
  await prisma.descriptorsOnProperties.updateMany({
    where: { propertyId: 0 },
    data: { propertyId: result.id },
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
      publishingStatus: "PENDING",

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
