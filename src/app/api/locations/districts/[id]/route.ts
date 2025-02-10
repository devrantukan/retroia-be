import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DistrictSchema } from "@/lib/validations/location";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

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
    const validatedData = DistrictSchema.parse(body);

    // Get city name for the relation
    const city = await prisma.city.findUnique({
      where: { city_id: validatedData.city_id },
    });

    if (!city) {
      return NextResponse.json({ error: "Şehir bulunamadı" }, { status: 400 });
    }

    const district = await prisma.district.update({
      where: { district_id: parseInt(params.id) },
      data: {
        district_name: validatedData.district_name,
        city_id: validatedData.city_id,
        city_name: city.city_name,
        slug: validatedData.slug,
      },
    });

    return NextResponse.json(district);
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

    await prisma.district.delete({
      where: { district_id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Bu ilçeye bağlı kayıtlar olduğu için silinemez" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
