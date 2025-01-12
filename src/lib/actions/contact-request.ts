import { prisma } from "@/lib/prisma";

export async function updateContactRequestStatus(id: string, status: string) {
  try {
    await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating contact request:", error);
    throw new Error("Failed to update contact request");
  }
}

export async function deleteContactRequest(id: string) {
  try {
    await prisma.contactRequest.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact request:", error);
    throw new Error("Failed to delete contact request");
  }
}
