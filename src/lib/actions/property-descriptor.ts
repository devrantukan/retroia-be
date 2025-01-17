"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  CategoryFormData,
  DescriptorFormData,
} from "@/lib/validations/property-descriptor";

// Category Actions
export async function getCategories() {
  return await prisma.propertyDescriptorCategory.findMany({
    include: {
      type: {
        select: {
          id: true,
          value: true,
        },
      },
    },
  });
}

export async function getCategory(id: number) {
  return await prisma.propertyDescriptorCategory.findUnique({
    where: { id },
    include: {
      type: true,
      descriptors: true,
    },
  });
}

export async function createCategory(data: CategoryFormData) {
  const category = await prisma.propertyDescriptorCategory.create({
    data: {
      value: data.value,
      slug: data.slug,
      typeId: data.typeId,
    },
  });
  revalidatePath("/admin/property-descriptors");
  return category;
}

export async function updateCategory(id: number, data: CategoryFormData) {
  const category = await prisma.propertyDescriptorCategory.update({
    where: { id },
    data: {
      value: data.value,
      slug: data.slug,
      typeId: data.typeId,
    },
  });
  revalidatePath("/admin/property-descriptors");
  return category;
}

export async function deleteCategory(id: number) {
  return await prisma.propertyDescriptorCategory.delete({
    where: { id },
  });
}

// Descriptor Actions
export async function getDescriptors() {
  return await prisma.propertyDescriptor.findMany({
    include: {
      category: {
        include: {
          type: true,
        },
      },
    },
  });
}

export async function getDescriptor(id: number) {
  return await prisma.propertyDescriptor.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function createDescriptor(data: DescriptorFormData) {
  const descriptor = await prisma.propertyDescriptor.create({
    data: {
      value: data.value,
      slug: data.slug,
      categoryId: data.categoryId,
    },
  });
  revalidatePath("/admin/property-descriptors");
  return descriptor;
}

export async function updateDescriptor(id: number, data: DescriptorFormData) {
  const descriptor = await prisma.propertyDescriptor.update({
    where: { id },
    data: {
      value: data.value,
      slug: data.slug,
      categoryId: data.categoryId,
    },
  });
  revalidatePath("/admin/property-descriptors");
  return descriptor;
}

export async function deleteDescriptor(id: number) {
  return await prisma.propertyDescriptor.delete({
    where: { id },
  });
}

export async function getPropertyTypes() {
  return await prisma.propertyType.findMany();
}
