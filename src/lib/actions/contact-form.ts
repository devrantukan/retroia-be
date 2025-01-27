"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ContactFormType } from "../validations/contact-form";

export async function getContactForms(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [contactForms, total] = await Promise.all([
    prisma.contactRequest.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.contactRequest.count(),
  ]);

  return {
    contactForms,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getContactForm(id: string) {
  return await prisma.contactRequest.findUnique({
    where: { id },
  });
}

export async function updateContactForm(
  id: string,
  data: Partial<ContactFormType>
) {
  const updated = await prisma.contactRequest.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/contact-forms");
  return updated;
}

export async function deleteContactForm(id: string) {
  await prisma.contactRequest.delete({
    where: { id },
  });

  revalidatePath("/admin/contact-forms");
}
