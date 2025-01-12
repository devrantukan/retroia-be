import { prisma } from "@/lib/prisma";

export async function deleteProspectAgent(id: number) {
  try {
    await prisma.prospectAgent.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting prospect agent:", error);
    throw new Error("Failed to delete prospect agent");
  }
}
