import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { district: string } },
  response: NextResponse
) {
  const projectLocations = await prisma.propertyLocation.findMany({
    distinct: ["neighborhood"],
  });

  // console.log(params.district);

  function capitalize(s: string): string {
    return String(s[0]).toLocaleUpperCase("tr") + String(s).slice(1);
  }
  const data: any[] = [];

  const neighborhoodData = await prisma.neighborhood.findMany({
    where: { district_name: capitalize(params.district) },
  });

  if (neighborhoodData) {
    neighborhoodData.forEach((neighborhood) => {
      data.push({
        neighborhood_id: neighborhood.neighborhood_id,
        label: neighborhood.neighborhood_name,
        value: slugify(neighborhood.neighborhood_name, {
          lower: true,
        }),
        district_name: capitalize(
          neighborhood.district_name.toLocaleLowerCase("tr")
        ),
        district_slug: slugify(neighborhood.district_name, {
          lower: true,
        }),
      });
    });
  }

  // console.log(data);

  return NextResponse.json(data);
}
