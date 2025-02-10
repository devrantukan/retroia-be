import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { CountrySchema } from "@/lib/validations/location";

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
    const validatedData = CountrySchema.parse(body);

    const country = await prisma.country.update({
      where: { country_id: parseInt(params.id) },
      data: {
        country_name: validatedData.country_name,
        slug: validatedData.slug,
      },
    });

    return NextResponse.json(country);
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

    await prisma.country.delete({
      where: { country_id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Bu ülkeye bağlı kayıtlar olduğu için silinemez" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
