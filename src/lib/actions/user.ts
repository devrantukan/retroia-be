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
  userId: number
) {
  try {
    const updatedUser = await prisma.officeWorker.update({
      where: { id: userId },
      data: {
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        about: data.about,
        avatarUrl: data.avatarUrl,
        commercialDocumentId: data.commercialDocumentId,
        companyLegalName: data.companyLegalName,
        xAccountId: data.xAccountId,
        facebookAccountId: data.facebookAccountId,
        linkedInAccountId: data.linkedInAccountId,
        youtubeAccountId: data.youtubeAccountId,
        instagramAccountId: data.instagramAccountId,
        webUrl: data.webUrl,
      },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Profile güncellenirken bir hata oluştu" };
  }
}
