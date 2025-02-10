import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NeighborhoodSchema } from "@/lib/validations/location";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "10");
    const skip = (page - 1) * per_page;

    const [total, items] = await Promise.all([
      prisma.neighborhood.count(),
      prisma.neighborhood.findMany({
        take: per_page,
        skip: skip,
        orderBy: {
          neighborhood_name: "asc",
        },
        include: {
          district: {
            include: {
              city: true,
            },
          },
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
    console.error("Error fetching neighborhoods:", error);
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
    const { neighborhood_name, district_id, slug } = body;

    // Validate required fields
    if (!neighborhood_name || !district_id || !slug) {
      return NextResponse.json(
        { error: "Mahalle adı, ilçe ve slug zorunludur" },
        { status: 400 }
      );
    }

    // Get district information
    const district = await prisma.district.findUnique({
      where: { district_id: parseInt(district_id) },
      include: {
        city: {
          include: {
            country: true,
          },
        },
      },
    });

    if (!district) {
      return NextResponse.json({ error: "İlçe bulunamadı" }, { status: 400 });
    }

    // Get the last neighborhood_id
    const lastNeighborhood = await prisma.neighborhood.findFirst({
      orderBy: {
        neighborhood_id: "desc",
      },
    });

    const nextNeighborhoodId = lastNeighborhood
      ? lastNeighborhood.neighborhood_id + 1
      : 1;

    // Create neighborhood with all required fields
    const neighborhood = await prisma.neighborhood.create({
      data: {
        neighborhood_id: nextNeighborhoodId,
        neighborhood_name,
        district_id: parseInt(district_id),
        district_name: district.district_name,
        city_id: district.city_id,
        city_name: district.city_name,
        slug,
      },
      include: {
        district: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(neighborhood);
  } catch (error: any) {
    console.error("Error creating neighborhood:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu mahalle adı veya slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
