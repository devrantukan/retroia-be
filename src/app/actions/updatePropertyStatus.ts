"use server";

import { prisma } from "@/lib/prisma";

export async function updatePublishingStatus(
  propertyId: string,
  status: "PENDING" | "PUBLISHED"
) {
  await prisma.property.update({
    where: { id: parseInt(propertyId) },
    data: { publishingStatus: status },
  });
}
