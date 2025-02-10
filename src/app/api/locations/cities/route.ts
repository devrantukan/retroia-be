import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { CitySchema } from "@/lib/validations/location";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const cities = await prisma.city.findMany({
      ...(limit > 0 ? { take: limit } : {}),
      orderBy: {
        city_name: "asc",
      },
    });

    return NextResponse.json({
      items: cities,
      total: await prisma.city.count(),
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { getAccessToken } = await getKindeServerSession();
    const accessToken: any = await getAccessToken();
    const role = accessToken?.roles?.[0]?.key;
    if (!user?.id || role !== "site-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { city_name, country_id, slug } = body;

    // Validate required fields
    if (!city_name || !country_id || !slug) {
      return NextResponse.json(
        { error: "Şehir adı, ülke ve slug zorunludur" },
        { status: 400 }
      );
    }

    // Get the last city_id
    const lastCity = await prisma.city.findFirst({
      orderBy: {
        city_id: "desc",
      },
    });

    const nextCityId = lastCity ? lastCity.city_id + 1 : 1;

    // Get country name from the provided country_id
    const country = await prisma.country.findUnique({
      where: { country_id },
    });

    if (!country) {
      return NextResponse.json({ error: "Ülke bulunamadı" }, { status: 400 });
    }

    // Create city with explicit city_id
    const city = await prisma.city.create({
      data: {
        city_id: nextCityId,
        city_name,
        country_id,
        country_name: country.country_name,
        slug,
      },
      include: {
        country: true,
      },
    });

    return NextResponse.json(city);
  } catch (error: any) {
    console.error("Error creating city:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu şehir adı veya slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
