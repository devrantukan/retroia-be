import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: number } },
  response: NextResponse
) {
  const property = await prisma.property.findUnique({
    where: {
      id: +params.id,
    },
    include: {
      status: true,
      feature: true,
      location: true,
      agent: true,
      images: true,
      contract: true,
      type: true,
      descriptors: {
        include: {
          descriptor: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
  // console.log(property);

  return NextResponse.json(property);
}
