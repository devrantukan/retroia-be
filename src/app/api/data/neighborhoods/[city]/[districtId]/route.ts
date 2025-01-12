import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string; districtId: string } }
) {
  const neighborhoods = await prisma.neighborhood.findMany({
    where: {
      city_id: parseInt(params.city),
      district_id: parseInt(params.districtId),
    },
  });

  const neighborhoodNames = neighborhoods.map((neighborhood) => ({
    neighborhood_id: neighborhood.neighborhood_id,
    neighborhood_name: neighborhood.neighborhood_name,
  }));
  // districtsObj[params.city] = districtNames;

  // console.log(JSON.stringify(districtsObj));

  return NextResponse.json(neighborhoodNames);
}
