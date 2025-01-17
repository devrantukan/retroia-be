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
      subType: true,
      agent: {
        include: {
          office: true,
          role: true,
        },
      },
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const locationData = JSON.parse(formData.get("location") as string);

    const property = await prisma.property.update({
      where: { id: parseInt(params.id) },
      data: {
        // ... other property fields
        location: {
          update: {
            latitude: locationData.latitude
              ? parseFloat(locationData.latitude)
              : undefined,
            longitude: locationData.longitude
              ? parseFloat(locationData.longitude)
              : undefined,
            streetAddress: locationData.streetAddress,
            zip: locationData.zip,
            country: locationData.country,
            city: locationData.city,
            district: locationData.district,
            neighborhood: locationData.neighborhood,
          },
        },
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}
