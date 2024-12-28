import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: number } },
  response: NextResponse
) {
  const category = await prisma.propertyDescriptorCategory.findFirst({
    where: {
      id: +params.id,
    },
    include: {
      descriptors: true,
    },
  });
  console.log(category);

  return NextResponse.json(category);
}
