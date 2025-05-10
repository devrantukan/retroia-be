import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Sort images by order to ensure sequential updates
    const sortedImages = [...images].sort((a, b) => a.order - b.order);

    // First, get all existing images to verify
    const existingImages = await prisma.propertyImage.findMany({
      where: {
        id: {
          in: images.map((img) => img.id),
        },
      },
    });

    // Update all images in a transaction
    const updatedImages = await prisma.$transaction(async (tx) => {
      // Update each image with its new order
      const updates = await Promise.all(
        sortedImages.map((image) =>
          tx.propertyImage.update({
            where: { id: image.id },
            data: { order: image.order },
          })
        )
      );

      // Verify the updates immediately
      const verifiedUpdates = await tx.propertyImage.findMany({
        where: {
          id: {
            in: images.map((img) => img.id),
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      // Verify that each image has the correct order
      const isOrderCorrect = verifiedUpdates.every(
        (img, index) => img.order === sortedImages[index].order
      );

      if (!isOrderCorrect) {
        throw new Error("Order verification failed");
      }

      return verifiedUpdates;
    });

    // Final verification
    const finalImages = await prisma.propertyImage.findMany({
      where: {
        id: {
          in: images.map((img) => img.id),
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // Verify the final order matches the requested order
    const isFinalOrderCorrect = finalImages.every(
      (img, index) => img.order === sortedImages[index].order
    );

    if (!isFinalOrderCorrect) {
      throw new Error("Final order verification failed");
    }

    return NextResponse.json({
      success: true,
      images: finalImages,
    });
  } catch (error) {
    console.error("Error updating image order:", error);
    return NextResponse.json(
      { error: "Failed to update image order" },
      { status: 500 }
    );
  }
}
