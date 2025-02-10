import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { NeighborhoodSchema } from "@/lib/validations/location";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { getAccessToken } = await getKindeServerSession();
    const accessToken: any = await getAccessToken();
    const role = accessToken?.roles?.[0]?.key;
    if (!user?.id || role !== "site-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = NeighborhoodSchema.parse(body);

    // Get district and city names for the relations
    const district = await prisma.district.findUnique({
      where: { district_id: validatedData.district_id },
      include: { city: true },
    });

    if (!district) {
      return NextResponse.json({ error: "İlçe bulunamadı" }, { status: 400 });
    }

    const neighborhood = await prisma.neighborhood.update({
      where: { neighborhood_id: parseInt(params.id) },
      data: {
        neighborhood_name: validatedData.neighborhood_name,
        district_id: validatedData.district_id,
        district_name: district.district_name,
        city_id: district.city_id,
        city_name: district.city_name,
        slug: validatedData.slug,
      },
    });

    return NextResponse.json(neighborhood);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu kayıt zaten mevcut" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { getAccessToken } = await getKindeServerSession();
    const accessToken: any = await getAccessToken();
    const role = accessToken?.roles?.[0]?.key;
    if (!user?.id || role !== "site-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.neighborhood.delete({
      where: { neighborhood_id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Bu mahalleye bağlı kayıtlar olduğu için silinemez" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
