"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateReviewApproval(id: number, isApproved: number) {
  try {
    await prisma.officeWorkerReview.update({
      where: { id },
      data: { isApproved },
    });
    revalidatePath("/admin/office-worker-reviews");
  } catch (error) {
    console.error("Error updating review approval:", error);
    throw new Error("Değerlendirme onay durumu güncellenirken bir hata oluştu");
  }
}

export async function deleteReview(id: number) {
  try {
    await prisma.officeWorkerReview.delete({
      where: { id },
    });
    revalidatePath("/admin/office-worker-reviews");
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Değerlendirme silinirken bir hata oluştu");
  }
}
