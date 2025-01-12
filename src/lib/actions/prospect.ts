import { prisma } from "@/lib/prisma";

export async function deleteProspect(id: number) {
  try {
    await prisma.prospectCustomer.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting prospect:", error);
    throw new Error("Failed to delete prospect");
  }
}
