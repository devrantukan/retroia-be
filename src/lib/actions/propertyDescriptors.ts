"use server";

import { prisma } from "../prisma";
import { z } from "zod";

export async function getPropertyDescriptors() {
  const descriptors = await prisma.propertyDescriptor.findMany({
    select: {
      slug: true,
    },
  });
  console.log(descriptors);

  return Object.fromEntries(
    descriptors.map((descriptor) => [
      descriptor.slug.includes("-") ? descriptor.slug : descriptor.slug,
      false,
    ])
  );
}
