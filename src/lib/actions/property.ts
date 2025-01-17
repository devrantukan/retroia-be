"use server";

import { AddPropertyInputType } from "@/lib/zodSchema";
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
  propertyData: AddPropertyInputType
) {
  try {
    console.log("Received property data:", propertyData); // Debug log

    // Ensure we have valid coordinates
    const latitude = propertyData.location.latitude
      ? Number(propertyData.location.latitude)
      : undefined;
    const longitude = propertyData.location.longitude
      ? Number(propertyData.location.longitude)
      : undefined;

    console.log("Processing coordinates:", { latitude, longitude }); // Debug log

    // Update location first
    const locationUpdate = await prisma.$transaction(async (prisma) => {
      const location = await prisma.propertyLocation.update({
        where: { propertyId },
        data: {
          country: propertyData.location.country,
          city: propertyData.location.city,
          district: propertyData.location.district,
          neighborhood: propertyData.location.neighborhood,
          latitude,
          longitude,
          streetAddress: propertyData.location.streetAddress || "",
        },
      });

      // Update property
      const property = await prisma.property.update({
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
        },
        include: {
          location: true,
        },
      });

      return property;
    });

    console.log("Update result:", locationUpdate); // Debug log
    return locationUpdate;
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

export async function createProperty(data: any) {
  try {
    return await prisma.property.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discountedPrice: data.discountedPrice,
        type: data.propertyType,
        statusId: data.statusId,
        agentId: data.agentId,
        videoSource: data.videoSource,
        threeDSource: data.threeDSource,
        publishingStatus: "PENDING",
        user: { connect: { id: data.userId } },
        subType: data.subType,
        status: { connect: { id: data.statusId } },
        agent: { connect: { id: data.agentId } },
        contract: data.contract,
        feature: {
          create: {
            ...data.propertyFeature,
          },
        },
        location: {
          create: {
            streetAddress: data.location.streetAddress,
            city: data.location.city,
            state: data.location.state,
            zip: data.location.zip,
            country: data.location.country,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            landmark: data.location.landmark || null,
            district: data.location.district || null,
            neighborhood: data.location.neighborhood || null,
            region: data.location.region || null,
          },
        },
        descriptors: {
          create: data.propertyDescriptors.map((descriptorId: number) => ({
            descriptorId,
          })),
        },
        images: {
          create: data.images.map((img: string) => ({
            url: img,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Create property error:", error);
    throw error;
  }
}
export async function updateProperty(id: number, data: any) {
  try {
    const locationUpdate = await prisma.propertyLocation.upsert({
      where: {
        propertyId: Number(id),
      },
      create: {
        propertyId: Number(id),
        country: data.location.country,
        city: data.location.city,
        district: data.location.district,
        neighborhood: data.location.neighborhood,
        latitude: Number(data.location.latitude),
        longitude: Number(data.location.longitude),
        streetAddress: data.location.address,
        state: data.location.state || "",
        zip: data.location.zip || "",
        landmark: data.location.landmark || null,
        region: data.location.region || null,
      },
      update: {
        country: data.location.country,
        city: data.location.city,
        district: data.location.district,
        neighborhood: data.location.neighborhood,
        latitude: Number(data.location.latitude),
        longitude: Number(data.location.longitude),
        streetAddress: data.location.address,
        state: data.location.state || "",
        zip: data.location.zip || "",
        landmark: data.location.landmark || null,
        region: data.location.region || null,
      },
    });

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description,
        // ... other property fields
      },
      include: {
        location: true,
      },
    });

    return { success: true, data: updatedProperty };
  } catch (error) {
    console.error("Update property error:", error);
    throw error;
  }
}
