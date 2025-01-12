import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  const countries = await prisma.country.findMany({});

  const countryNames = countries.map((country) => ({
    country_id: country.country_id,
    country_name: country.country_name,
  }));
  console.log(countryNames);

  return NextResponse.json(countryNames);
}
