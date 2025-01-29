import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string; district: string } }
) {
  //  console.log(params);
  const neighborhoodData = await prisma.neighborhood.findMany({
    where: {
      district_name: params.district,
      city_name: params.city,
    },
    orderBy: {
      neighborhood_name: "asc",
    },
  });
  // console.log(neighborhoodData);
  const data = neighborhoodData.map((neighborhood) => ({
    neighborhood_id: neighborhood.neighborhood_id,
    label: neighborhood.neighborhood_name,
    value: slugify(neighborhood.neighborhood_name, { lower: true }),
    district_name: capitalize(neighborhood.district_name),
    district_slug: slugify(neighborhood.district_name, { lower: true }),
  }));

  return NextResponse.json(data);
}

function capitalize(s: string): string {
  return String(s[0]).toLocaleUpperCase("tr") + String(s).slice(1);
}
