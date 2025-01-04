import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyType: string; contract: string } },
  response: NextResponse
) {
  console.log(params.propertyType);
  const projectLocations = await prisma.propertyLocation.findMany({
    distinct: ["city"],
  });

  let cities: string[] = [];

  projectLocations.forEach((location) => {
    cities.push(location.city);
  });

  function capitalize(s: string): string {
    return String(s[0]).toLocaleUpperCase("tr") + String(s).slice(1);
  }
  const data: any[] = [];
  await Promise.all(
    cities.map(async (city) => {
      const cityData = await prisma.city.findFirst({
        where: { city_name: city.toLocaleUpperCase("tr-TR") },
      });

      if (cityData) {
        data.push({
          city_id: cityData.city_id,
          label: capitalize(cityData.city_name.toLocaleLowerCase("tr-TR")),
          value: slugify(cityData.city_name, {
            lower: true,
          }),
          country_name: capitalize(
            cityData.country_name.toLocaleLowerCase("tr-TR")
          ),
          country_slug: slugify(cityData.country_name, {
            lower: true,
          }),
        });
      }
    })
  );

  return NextResponse.json(data);
}
