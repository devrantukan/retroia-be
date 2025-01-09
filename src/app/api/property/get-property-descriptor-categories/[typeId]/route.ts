import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { typeId: string } }
) {
  try {
    const typeId = parseInt(params.typeId);

    const descriptorCategories =
      await prisma.propertyDescriptorCategory.findMany({
        where: {
          typeId: typeId,
        },
        include: {
          descriptors: true,
        },
      });

    return NextResponse.json(descriptorCategories);
  } catch (error) {
    console.error("Error fetching descriptor categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch descriptor categories" },
      { status: 500 }
    );
  }
}
