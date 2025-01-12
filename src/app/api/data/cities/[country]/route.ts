import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  const cities = await prisma.city.findMany({
    where: {
      country_id: parseInt(params.country),
    },
  });

  const cityNames = cities.map((city) => ({
    city_id: city.city_id,
    city_name: city.city_name,
  }));
  console.log(cityNames);

  return NextResponse.json(cityNames);
}
