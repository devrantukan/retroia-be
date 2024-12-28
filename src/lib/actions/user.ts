"use server";

import prisma from "../prisma";

import {
  userProfileSchema,
  UserProfileFormData,
} from "@/lib/userProfileFormSchema";

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function getUserAsOfficeWorker(id: string) {
  console.log(id);
  return await prisma.officeWorker.findFirst({
    where: {
      userId: id,
    },
  });
}

export async function updateUserAvatar(avatarUrl: string, userId: string) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      avatarUrl: avatarUrl,
    },
  });
}

export async function submitUserProfile(
  data: UserProfileFormData,
  officeWorkerId: number
) {
  const result = userProfileSchema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  // Here you would typically save the data to your database
  console.log("Submitted data:", result.data);

  await prisma.officeWorker.update({
    where: {
      id: officeWorkerId,
    },
    data: {
      // Add the fields you want to update
      name: result.data.name,
      surname: result.data.surname,
      phone: result.data.phone,
      avatarUrl: result.data.avatarUrl,
      about: result.data.about,
      xAccountId: result.data.xAccountId,
      facebookAccountId: result.data.facebookAccountId,
      linkedInAccountId: result.data.linkedInAccountId,
      // Add other fields as needed
    },
  });

  return { success: true, data: result.data };
}
