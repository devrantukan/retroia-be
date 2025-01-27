"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OfficeFormType } from "../validations/office";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const REVALIDATION_TOKEN = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;

async function revalidateFrontend(path: string) {
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
    });

    if (!response.ok) {
      throw new Error(`Failed to revalidate: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Revalidation error:", error);
  }
}

export async function saveOffice(
  data: OfficeFormType & { avatarUrl?: string }
) {
  try {
    const office = await prisma.office.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        fax: data.fax || "",
        description: data.description || "",
        streetAddress: data.streetAddress,
        zip: data.zip || "",
        countryId: Number(data.countryId),
        cityId: Number(data.cityId),
        districtId: Number(data.districtId),
        neighborhoodId: Number(data.neighborhoodId),
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        avatarUrl: data.avatarUrl || "",
        xAccountId: data.xAccountId || "",
        facebookAccountId: data.facebookAccountId || "",
        linkedInAccountId: data.linkedInAccountId || "",
        instagramAccountId: data.instagramAccountId || "",
        youtubeAccountId: data.youtubeAccountId || "",
        webUrl: data.webUrl || "",
        slug: data.slug || "",
      },
    });

    // Revalidate admin path
    revalidatePath("/admin/offices");

    // Revalidate frontend paths using the helper function
    await Promise.all([
      revalidateFrontend("/"),
      revalidateFrontend("/ofislerimiz"),
      revalidateFrontend(`/ofis/${office.id}/${office.slug}`),
      revalidateFrontend("/iletisim"),
    ]);

    return office;
  } catch (error) {
    console.error("Error creating office:", error);
    throw error;
  }
}

export async function updateOffice(
  id: number,
  data: OfficeFormType & { avatarUrl?: string }
) {
  try {
    const office = await prisma.office.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        fax: data.fax || "",
        webUrl: data.webUrl || "",
        streetAddress: data.streetAddress,
        countryId: data.countryId,
        cityId: data.cityId,
        districtId: data.districtId,
        neighborhoodId: data.neighborhoodId,
        zip: data.zip || "",
        xAccountId: data.xAccountId || "",
        facebookAccountId: data.facebookAccountId || "",
        linkedInAccountId: data.linkedInAccountId || "",
        instagramAccountId: data.instagramAccountId || "",
        youtubeAccountId: data.youtubeAccountId || "",
        avatarUrl: data.avatarUrl || "",
        slug: data.slug,
      },
    });

    // Revalidate admin path
    revalidatePath("/admin/offices");

    // Revalidate frontend paths using the helper function
    await Promise.all([
      revalidateFrontend("/"),
      revalidateFrontend("/ofislerimiz"),
      revalidateFrontend(`/ofis/${id}/${data.slug}`),
      revalidateFrontend("/iletisim"),
    ]);

    return office;
  } catch (error) {
    console.error("Error updating office:", error);
    throw error;
  }
}

export async function deleteOffice(id: number) {
  try {
    const office = await prisma.office.delete({
      where: { id },
      select: { slug: true }, // Get the slug for path revalidation
    });

    // Revalidate admin path
    revalidatePath("/admin/offices");

    // Revalidate frontend paths using the helper function
    await Promise.all([
      revalidateFrontend("/"),
      revalidateFrontend("/ofislerimiz"),
      revalidateFrontend(`/ofis/${id}/${office.slug}`),
      revalidateFrontend("/iletisim"),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error deleting office:", error);
    throw new Error("Failed to delete office");
  }
}
