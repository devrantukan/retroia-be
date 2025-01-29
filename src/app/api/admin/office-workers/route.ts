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
    const workers = await prisma.officeWorker.findMany({
      include: {
        office: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("Error fetching office workers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { getUser, getAccessToken } = getKindeServerSession();
  const user = await getUser();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "office-workers") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await request.json();
    const worker = await prisma.officeWorker.create({
      data: {
        ...data,
        roleId: parseInt(data.roleId),
        officeId: parseInt(data.officeId),
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("Error creating office worker:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { getUser, getAccessToken } = getKindeServerSession();
  const user = await getUser();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "office-workers") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const worker = await prisma.officeWorker.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        roleId: parseInt(updateData.roleId),
        officeId: parseInt(updateData.officeId),
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("Error updating office worker:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { getUser, getAccessToken } = getKindeServerSession();
  const user = await getUser();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "office-workers") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const worker = await prisma.officeWorker.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("Error deleting office worker:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
