import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } },
  response: NextResponse
) {
  // const projectLocations = await prisma.propertyLocation.findMany({
  //   distinct: ["district"],
  // });

  // let districts: string[] = [];

  // projectLocations.forEach((location) => {
  //   districts.push(location.district);
  // });

  console.log("params city", params.city);
  const districts = await prisma.district.findMany({
    where: { city_name: params.city },
  });

  // console.log(districts);
  function capitalize(s: string): string {
    return String(s[0]).toLocaleUpperCase("tr") + String(s).slice(1);
  }
  const data: any[] = [];
  await Promise.all(
    districts.map(async (district) => {
      data.push({
        district_id: district.district_id,
        label: district.district_name,
        value: slugify(district.district_name, {
          lower: true,
        }),
        city_name: district.city_name,
        city_slug: slugify(district.city_name, {
          lower: true,
        }),
      });
    })
  );
  //console.log(data);
  return NextResponse.json(data);
}
