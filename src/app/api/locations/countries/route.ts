import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CountrySchema } from "@/lib/validations/location";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "10");
    const skip = (page - 1) * per_page;

    const [total, items] = await Promise.all([
      prisma.country.count(),
      prisma.country.findMany({
        take: per_page,
        skip: skip,
        orderBy: {
          country_name: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  } catch (error: any) {
    console.error("Error fetching countries:", error);
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
    const { country_name, slug } = body;

    // Validate required fields
    if (!country_name || !slug) {
      return NextResponse.json(
        { error: "Ülke adı ve slug zorunludur" },
        { status: 400 }
      );
    }

    // Get the last country_id
    const lastCountry = await prisma.country.findFirst({
      orderBy: {
        country_id: "desc",
      },
    });

    const nextCountryId = lastCountry ? lastCountry.country_id + 1 : 1;

    // Create country with explicit country_id
    const country = await prisma.country.create({
      data: {
        country_id: nextCountryId,
        country_name,
        slug,
      },
    });

    return NextResponse.json(country);
  } catch (error: any) {
    console.error("Error creating country:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu ülke adı veya slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
