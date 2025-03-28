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
  //console.log(updateData);
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

  let descriptorData:
    | { updateData: { propertyId: number; descriptorId: number }[] }
    | undefined;

  if (propertyData.propertyDescriptors) {
    descriptorData = await manageDescriptorData(
      propertyData.propertyDescriptors,
      0
    );
  }

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
        create:
          descriptorData?.updateData.map(({ descriptorId }) => ({
            descriptorId,
          })) || [],
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
    // Handle descriptors outside transaction
    let descriptorData:
      | { updateData: { propertyId: number; descriptorId: number }[] }
      | undefined;
    if (data.propertyDescriptors) {
      await prisma.descriptorsOnProperties.deleteMany({
        where: { propertyId: id },
      });
      descriptorData = await manageDescriptorData(data.propertyDescriptors, id);
    }

    return await prisma.$transaction(
      async (tx) => {
        // Create descriptors if needed
        if (descriptorData && descriptorData.updateData.length > 0) {
          await tx.descriptorsOnProperties.createMany({
            data: descriptorData.updateData,
          });
        }

        // Handle images
        if (deletedImageIDs.length > 0) {
          await tx.propertyImage.deleteMany({
            where: { id: { in: deletedImageIDs } },
          });
        }

        // Update existing images order in a single batch
        if (data.existingImages?.length > 0) {
          const activeImages = data.existingImages.filter(
            (img: { id: number }) => !deletedImageIDs.includes(img.id)
          );

          if (activeImages.length > 0) {
            const sortedExistingImages = [...activeImages].sort(
              (a, b) => a.order - b.order
            );
            await Promise.all(
              sortedExistingImages.map((img, index) =>
                tx.propertyImage.update({
                  where: { id: img.id },
                  data: { order: index },
                })
              )
            );
          }
        }

        // Add new images with correct order
        if (imagesUrls.length > 0) {
          const startOrder = data.existingImages?.length || 0;
          await tx.propertyImage.createMany({
            data: imagesUrls.map((url, index) => ({
              propertyId: id,
              url: url,
              order: startOrder + index,
            })),
          });
        }

        // Update property
        return await tx.property.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            discountedPrice: data.discountedPrice
              ? Number(data.discountedPrice)
              : undefined,
            statusId: Number(data.statusId),
            typeId: Number(data.typeId),
            subTypeId: Number(data.subTypeId) || undefined,
            contractId: Number(data.contractId),
            agentId: Number(data.agentId) || undefined,
            videoSource: data.videoSource || "",
            threeDSource: data.threeDSource || "",
            location: {
              update: {
                ...data.location,
                latitude: Number(data.location.latitude),
                longitude: Number(data.location.longitude),
              },
            },
            feature: {
              update: {
                ...data.propertyFeature,
                bedrooms: data.propertyFeature.bedrooms.toString(),
                bathrooms: Number(data.propertyFeature.bathrooms),
                floor: Number(data.propertyFeature.floor),
                totalFloor: Number(data.propertyFeature.totalFloor),
                area: Number(data.propertyFeature.area),
              },
            },
          },
          include: {
            images: {
              orderBy: { order: "asc" },
            },
            location: true,
            feature: true,
            descriptors: {
              include: {
                descriptor: true,
              },
            },
          },
        });
      },
      {
        timeout: 60000, // Increased to 60 seconds
      }
    );
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

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      discountedPrice: true,
      feature: true,
      agent: true,
      images: true,
      status: true,
      type: true,
      contract: true,
      createdAt: true,
      updatedAt: true,
      location: {
        select: {
          city: true,
          district: true,
          neighborhood: true,
          latitude: true,
          longitude: true,
          streetAddress: true,
          zip: true,
          country: true,
          state: true,
          landmark: true,
        },
      },
      descriptors: {
        include: {
          descriptor: true,
        },
      },
    },
  });
}
