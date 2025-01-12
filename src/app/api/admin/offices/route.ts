import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { getUser, getAccessToken } = getKindeServerSession();
  const user = await getUser();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "site-admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const offices = await prisma.office.findMany({
      include: {
        city: true,
        district: true,
        workers: true,
      },
    });
    return NextResponse.json(offices);
  } catch (error) {
    console.error("Error fetching offices:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
