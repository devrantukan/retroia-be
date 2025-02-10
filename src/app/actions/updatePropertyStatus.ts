"use server";

import { prisma } from "@/lib/prisma";

export async function updatePublishingStatus(
  propertyId: string,
  status: "PUBLISHED" | "PENDING"
) {
  try {
    const result = await prisma.property.update({
      where: {
        id: parseInt(propertyId),
      },
      data: {
        publishingStatus: status,
      },
    });
    return result;
  } catch (error) {
    console.error("Error in updatePublishingStatus:", error);
    return null;
  }
}
