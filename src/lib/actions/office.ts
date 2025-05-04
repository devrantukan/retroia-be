"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OfficeFormType } from "../validations/office";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const REVALIDATION_TOKEN = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN;

async function revalidateFrontend(path: string) {
  try {
    if (!FRONTEND_URL || !REVALIDATION_TOKEN) {
      console.warn("Missing revalidation environment variables");
      return;
    }
    console.log("revalidating", `${FRONTEND_URL}/api/revalidate/`);
    const response = await fetch(`${FRONTEND_URL}/api/revalidate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({
        path,
        token: REVALIDATION_TOKEN,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Revalidation failed for ${path}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
    }
  } catch (error) {
    console.error(`Revalidation error for ${path}:`, error);
  }
}

export async function saveOffice(
  data: OfficeFormType & { avatarUrl?: string; images?: { url: string }[] }
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
        images: {
          create: data.images?.map((img) => ({ url: img.url })) || [],
        },
      },
      include: {
        images: true,
      },
    });

    // Revalidate all relevant paths

    revalidateFrontend("/"),
      revalidateFrontend("/ofislerimiz/"),
      revalidateFrontend(`/ofis/${office.id}/${office.slug}/`);

    return office;
  } catch (error) {
    console.error("Error creating office:", error);
    throw error;
  }
}

export async function updateOffice(
  id: number,
  data: OfficeFormType & {
    avatarUrl?: string;
    images?: { url: string }[];
    deletedImages?: number[];
  }
) {
  try {
    // First, delete any removed images
    if (data.deletedImages?.length) {
      await prisma.officeImage.deleteMany({
        where: {
          id: {
            in: data.deletedImages,
          },
        },
      });
    }

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
        images: {
          deleteMany: {},
          create: data.images?.map((img) => ({ url: img.url })) || [],
        },
      },
      include: {
        images: true,
      },
    });

    // Revalidate all relevant paths
    revalidatePath("/admin/offices");
    revalidatePath("/");
    revalidateFrontend("/ofislerimiz/");
    revalidateFrontend(`/ofis/${id}/${data.slug}/`);

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

    // Revalidate all relevant paths
    revalidatePath("/admin/offices");
    revalidatePath("/");
    revalidateFrontend("/ofislerimiz");
    revalidateFrontend(`/ofis/${id}/${office.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting office:", error);
    throw new Error("Failed to delete office");
  }
}
