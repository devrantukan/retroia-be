"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OfficeWorkerFormType } from "@/lib/validations/office-worker";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const REVALIDATION_TOKEN = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;

async function revalidateFrontend(path: string) {
  if (!FRONTEND_URL) {
    console.warn("FRONTEND_URL is not defined, skipping revalidation");
    return;
  }

  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        token: REVALIDATION_TOKEN,
      }),
    }).catch(() => {
      console.warn(`Failed to revalidate ${path}, frontend might be offline`);
      return null;
    });

    if (!response?.ok) {
      console.warn(`Failed to revalidate ${path}: ${response?.statusText}`);
    }
  } catch (error) {
    console.warn(`Revalidation warning for ${path}:`, error);
  }
}

export async function createOfficeWorker(data: OfficeWorkerFormType) {
  try {
    const worker = await prisma.officeWorker.create({
      data: {
        ...data,
        roleId: Number(data.roleId),
        officeId: Number(data.officeId),
        userId: data.userId || null,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        about: data.about || "",
        webUrl: data.webUrl || "",
        xAccountId: data.xAccountId || "",
        facebookAccountId: data.facebookAccountId || "",
        linkedInAccountId: data.linkedInAccountId || "",
        instagramAccountId: data.instagramAccountId || "",
        youtubeAccountId: data.youtubeAccountId || "",
        avatarUrl: data.avatarUrl || "",
        commercialDocumentId: data.commercialDocumentId || "",
        companyLegalName: data.companyLegalName || "",
        slug: `${data.name}-${data.surname}`.toLowerCase().replace(/\s+/g, "-"),
      },
      include: {
        office: true,
        role: true,
      },
    });

    // Revalidate admin path
    revalidatePath("/admin/office-workers");

    // Revalidate frontend paths
    await Promise.all([
      revalidateFrontend("/"),
      revalidateFrontend("/ofislerimiz"),
      revalidateFrontend(`/ofis/${worker.office.id}/${worker.office.slug}`),
      revalidateFrontend(
        `/ofis/${worker.office.id}/${worker.office.slug}/${worker.role.slug}/${worker.id}/${worker.slug}`
      ),
    ]);

    return worker;
  } catch (error) {
    console.error("Error creating office worker:", error);
    throw error;
  }
}

export async function updateOfficeWorker(
  id: number,
  data: OfficeWorkerFormType
) {
  try {
    const worker = await prisma.officeWorker.update({
      where: { id },
      data: {
        ...data,
        roleId: Number(data.roleId),
        officeId: Number(data.officeId),
        userId: data.userId || null,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        about: data.about || "",
        webUrl: data.webUrl || "",
        xAccountId: data.xAccountId || "",
        facebookAccountId: data.facebookAccountId || "",
        linkedInAccountId: data.linkedInAccountId || "",
        instagramAccountId: data.instagramAccountId || "",
        youtubeAccountId: data.youtubeAccountId || "",
        avatarUrl: data.avatarUrl || "",
        commercialDocumentId: data.commercialDocumentId || "",
        companyLegalName: data.companyLegalName || "",
        slug: `${data.name}-${data.surname}`.toLowerCase().replace(/\s+/g, "-"),
      },
      include: {
        office: true,
        role: true,
      },
    });

    // Revalidate admin path
    revalidatePath("/admin/office-workers");

    // Revalidate frontend paths with proper office data
    await Promise.all([
      revalidateFrontend("/"),
      revalidateFrontend("/ofislerimiz"),
      revalidateFrontend(`/ofis/${worker.office.id}/${worker.office.slug}`),
      revalidateFrontend(
        `/ofis/${worker.office.id}/${worker.office.slug}/${worker.role.slug}/${worker.id}/${worker.slug}`
      ),
    ]);

    return worker;
  } catch (error) {
    console.error("Error updating office worker:", error);
    throw error;
  }
}

export async function deleteOfficeWorker(id: number) {
  const worker = await prisma.officeWorker.delete({
    where: { id },
    select: {
      officeId: true,
      office: true,
      role: true,
      id: true,
      slug: true,
    },
  });

  revalidatePath("/admin/office-workers");
  revalidateFrontend(`/ofis/${worker.officeId}/${worker.office.slug}`);
  revalidateFrontend(
    `/ofis/${worker.officeId}/${worker.office.slug}/${worker.role.slug}/${worker.id}/${worker.slug}`
  );
  revalidateFrontend(`/`);
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

export async function saveOfficeWorker(data: OfficeWorkerFormType) {
  try {
    const worker = await prisma.officeWorker.create({
      data: {
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        about: data.about || "",
        roleId: Number(data.roleId),
        officeId: Number(data.officeId),
        webUrl: data.webUrl || "",
        xAccountId: data.xAccountId || "",
        facebookAccountId: data.facebookAccountId || "",
        linkedInAccountId: data.linkedInAccountId || "",
        instagramAccountId: data.instagramAccountId || "",
        youtubeAccountId: data.youtubeAccountId || "",
        avatarUrl: data.avatarUrl || "",
        commercialDocumentId: "",
        companyLegalName: "",
        slug: `${data.name}-${data.surname}`.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    return worker;
  } catch (error) {
    throw error;
  }
}
