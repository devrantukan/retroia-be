import { prisma } from "@/lib/prisma";

import { NextResponse } from "next/server";
import { DistrictSchema } from "@/lib/validations/location";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "10");
    const skip = (page - 1) * per_page;

    const [total, items] = await Promise.all([
      prisma.district.count(),
      prisma.district.findMany({
        take: per_page,
        skip: skip,
        orderBy: {
          district_name: "asc",
        },
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        country_name: item.city.country.country_name,
        country_id: item.city.country.country_id,
      })),
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  } catch (error: any) {
    console.error("Error fetching districts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Auth check
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
    const { district_name, city_id, slug } = body;

    // Validate required fields
    if (!district_name || !city_id || !slug) {
      return NextResponse.json(
        { error: "İlçe adı, şehir ve slug zorunludur" },
        { status: 400 }
      );
    }

    // Get city information
    const city = await prisma.city.findUnique({
      where: { city_id: parseInt(city_id) },
      include: { country: true },
    });

    if (!city) {
      return NextResponse.json({ error: "Şehir bulunamadı" }, { status: 400 });
    }

    // Get the last district_id
    const lastDistrict = await prisma.district.findFirst({
      orderBy: {
        district_id: "desc",
      },
    });

    const nextDistrictId = lastDistrict ? lastDistrict.district_id + 1 : 1;

    // Create district with all required fields
    const district = await prisma.district.create({
      data: {
        district_id: nextDistrictId,
        district_name,
        city_id: parseInt(city_id),
        city_name: city.city_name,
        slug,
      },
      include: {
        city: {
          include: {
            country: true,
          },
        },
      },
    });

    return NextResponse.json(district);
  } catch (error: any) {
    console.error("Error creating district:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu ilçe adı veya slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
