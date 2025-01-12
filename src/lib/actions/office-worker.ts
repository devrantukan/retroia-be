"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOfficeWorker(data: any) {
  const worker = await prisma.officeWorker.create({
    data: {
      ...data,
      roleId: parseInt(data.roleId),
      officeId: parseInt(data.officeId),
    },
  });

  revalidatePath("/admin/office-workers");
  return worker;
}

export async function updateOfficeWorker(id: number, data: any) {
  const worker = await prisma.officeWorker.update({
    where: { id },
    data: {
      ...data,
      roleId: parseInt(data.roleId),
      officeId: parseInt(data.officeId),
    },
  });

  revalidatePath("/admin/office-workers");
  return worker;
}

export async function deleteOfficeWorker(id: number) {
  const worker = await prisma.officeWorker.delete({
    where: { id },
  });

  revalidatePath("/admin/office-workers");
  return worker;
}

export async function getOfficeWorker(id: number) {
  return await prisma.officeWorker.findUnique({
    where: { id },
    include: {
      office: true,
      role: true,
    },
  });
}
