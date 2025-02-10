"use server";

import { AddPropertyInputType } from "@/app/user/properties/add/_components/AddPropertyForm";
import prisma from "../prisma";
import { Property } from "@prisma/client";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";

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
        create: {
          ...propertyData.propertyFeature,
          bedrooms: propertyData.propertyFeature.bedrooms.toString(),
          bathrooms: Number(propertyData.propertyFeature.bathrooms),
          floor: Number(propertyData.propertyFeature.floor),
          totalFloor: Number(propertyData.propertyFeature.totalFloor),
          area: Number(propertyData.propertyFeature.area),
        },
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
  id: number,
  data: any,
  imagesUrls: string[],
  deletedImageIDs: number[]
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Update property
      const property = await tx.property.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          discountedPrice: Number(data.discountedPrice) || 0,
          statusId: Number(data.statusId),
          typeId: Number(data.typeId),
          subTypeId: Number(data.subTypeId) || 0,
          contractId: Number(data.contractId),
          agentId: Number(data.agentId) || 0,
          videoSource: data.videoSource,
          threeDSource: data.threeDSource,
          location: {
            update: {
              country: data.location.country,
              city: data.location.city,
              district: data.location.district,
              neighborhood: data.location.neighborhood,
              latitude: Number(data.location.latitude),
              longitude: Number(data.location.longitude),
              streetAddress: data.location.streetAddress || "",
              state: data.location.state || "",
              zip: data.location.zip || "",
              landmark: data.location.landmark || "",
              region: data.location.region || "",
            },
          },
          feature: {
            update: {
              bedrooms: data.propertyFeature.bedrooms.toString(),
              bathrooms: Number(data.propertyFeature.bathrooms),
              floor: data.propertyFeature.floor,
              totalFloor: data.propertyFeature.totalFloor,
              area: data.propertyFeature.area,
            },
          },
          descriptors: {
            deleteMany: {},
          },
          images: {
            deleteMany: {},
          },
        },
      });

      // Update property features
      await tx.propertyFeature.update({
        where: { propertyId: id },
        data: {
          ...data.propertyFeature,
          bedrooms: data.propertyFeature.bedrooms.toString(),
          bathrooms: Number(data.propertyFeature.bathrooms),
          floor: Number(data.propertyFeature.floor),
          totalFloor: Number(data.propertyFeature.totalFloor),
          area: Number(data.propertyFeature.area),
        },
      });

      // Update property descriptors
      await tx.descriptorsOnProperties.deleteMany({
        where: { propertyId: id },
      });

      // Create new descriptors
      const descriptorEntries = Object.entries(data.propertyDescriptors)
        .filter(([_, value]) => value === true)
        .map(([key]) => ({
          propertyId: id,
          slug: key.replace(/"/g, ""), // Remove quotes if present
        }));

      if (descriptorEntries.length > 0) {
        const descriptors = await tx.propertyDescriptor.findMany({
          where: {
            slug: {
              in: descriptorEntries.map((d) => d.slug.replace(/"/g, "")),
            },
          },
        });
        await tx.descriptorsOnProperties.createMany({
          data: descriptorEntries.map(({ slug }) => ({
            propertyId: id,
            descriptorId: descriptors.find((d) => d.slug === slug)?.id || 0,
          })),
        });
      }

      return property;
    });
  } catch (error) {
    console.error("Error updating property:", error);
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

export async function uploadImages(images: File[]) {
  if (typeof window === "undefined") {
    // Server-side: Skip image processing
    return [];
  }

  try {
    const uploadPromises = images.map(async (image) => {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const filename = `${Date.now()}-${image.name}`;
      const filepath = path.join(process.cwd(), "public/uploads", filename);

      // Save file
      await writeFile(filepath, new Uint8Array(buffer));
      return `/uploads/${filename}`;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
}
