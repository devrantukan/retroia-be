import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      include: {
        officeWorker: true,
      },
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const officeWorker = await prisma.officeWorker.findUnique({
      where: {
        userId: user.id,
      },
    });

    const userResponse = {
      ...dbUser,
      agentId: officeWorker?.id || null,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
