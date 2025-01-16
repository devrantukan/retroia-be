"use server";

import { prisma } from "@/lib/prisma";

export async function getOfficeWorkerDetails(userId: string) {
  const officeWorker = await prisma.officeWorker.findUnique({
    where: { userId },
    select: {
      name: true,
      surname: true,
      avatarUrl: true,
    },
  });

  if (!officeWorker) throw new Error("Office worker not found");
  return officeWorker;
}

export async function updateAvatarInDb(userId: string, avatarUrl: string) {
  try {
    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      }),
      prisma.officeWorker.update({
        where: { userId },
        data: { avatarUrl },
      }),
    ]);
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
}
