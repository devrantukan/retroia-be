import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { typeId: number } },
  response: NextResponse
) {
  const descriptors = await prisma.propertyDescriptorCategory.findMany({
    where: {
      typeId: +params.typeId,
    },
    include: {
      descriptors: true,
    },
  });
  // console.log(descriptors);

  return NextResponse.json(descriptors);
}
