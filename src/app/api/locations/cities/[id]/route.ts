import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const city = await prisma.city.findUnique({
      where: {
        city_id: parseInt(params.id),
      },
    });

    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json(city);
  } catch (error) {
    console.error("Error fetching city:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.city.delete({
      where: { city_id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Bu şehre bağlı kayıtlar olduğu için silinemez" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
