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
          latitude: Number(propertyData.location.latitude),
          longitude: Number(propertyData.location.longitude),
          streetAddress: propertyData.location.streetAddress || "",
          city: propertyData.location.city,
          state: propertyData.location.state || "",
          zip: propertyData.location.zip || "",
          country: propertyData.location.country,
          district: propertyData.location.district,
          neighborhood: propertyData.location.neighborhood,
          region: propertyData.location.region || "",
          landmark: propertyData.location.landmark || "",
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
  imageUrls?: string[],
  deletedImageIDs?: number[]
) {
  console.log("Received property data:", typeof propertyData.location.latitude);

  try {
    // Handle descriptors outside transaction
    const descriptorData = await manageDescriptorData(
      propertyData.propertyDescriptors,
      propertyId
    );

    // Perform updates in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update location
      await tx.propertyLocation.update({
        where: { propertyId },
        data: {
          country: propertyData.location.country,
          city: propertyData.location.city,
          district: propertyData.location.district,
          neighborhood: propertyData.location.neighborhood,
          latitude: propertyData.location.latitude,

          longitude: propertyData.location.longitude,

          streetAddress: propertyData.location.streetAddress || "",
          state: propertyData.location.state || "",
          zip: propertyData.location.zip || "",
          landmark: propertyData.location.landmark || "",
          region: propertyData.location.region || "",
        },
      });

      // Update property
      return tx.property.update({
        where: { id: propertyId },
        data: {
          name: propertyData.name,
          description: propertyData.description,
          price: Number(propertyData.price),
          discountedPrice: Number(propertyData.discountedPrice) || 0,
          statusId: Number(propertyData.statusId),
          typeId: Number(propertyData.typeId),
          subTypeId: Number(propertyData.subTypeId) || 0,
          contractId: Number(propertyData.contractId),
          agentId: Number(propertyData.agentId) || 0,
          descriptors: {
            deleteMany: {},
            create: descriptorData.updateData.map(({ descriptorId }) => ({
              descriptorId,
            })),
          },
          ...(imageUrls && {
            images: {
              create: imageUrls.map((url) => ({ url })),
              ...(deletedImageIDs && {
                deleteMany: {
                  id: { in: deletedImageIDs },
                },
              }),
            },
          }),
        },
        include: {
          location: true,
          images: true,
          descriptors: true,
        },
      });
    });

    console.log("Update successful:", result);
    return result;
  } catch (error) {
    console.error("Property update error:", error);
    throw error;
  }
}
export async function deleteProperty(id: number) {
  const result = await prisma.property.delete({
    where: {
      id,
    },
  });
  return result;
}
