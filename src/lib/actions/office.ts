import { prisma } from "@/lib/prisma";

export async function saveOffice(data: any) {
  try {
    const office = await prisma.office.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        fax: data.fax || "",
        description: data.description,
        streetAddress: data.streetAddress,
        zip: data.zip,
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
        webUrl: data.webUrl,
        slug: data.slug,
      },
    });
    return office;
  } catch (error) {
    console.error("Error saving office:", error);
    throw new Error("Failed to save office");
  }
}

export async function updateOffice(id: number, data: any) {
  try {
    const office = await prisma.office.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        fax: data.fax || "",
        description: data.description,
        streetAddress: data.streetAddress,
        zip: data.zip,
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
        webUrl: data.webUrl,
        slug: data.slug,
      },
    });
    return office;
  } catch (error) {
    console.error("Error updating office:", error);
    throw new Error("Failed to update office");
  }
}

export async function deleteOffice(id: number) {
  try {
    await prisma.office.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting office:", error);
    throw new Error("Failed to delete office");
  }
}
