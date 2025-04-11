import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const pageSize = 10;

    // Build where clause for search and assigned agents
    const where: Prisma.ProjectWhereInput = {
      AND: [
        {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        },
        {
          OR: [
            { assignedAgents: { contains: user.id } },
            { assignedAgents: { startsWith: `${user.id},` } },
            { assignedAgents: { endsWith: `,${user.id}` } },
            { assignedAgents: { contains: `,${user.id},` } },
          ],
        },
        {
          publishingStatus: "PUBLISHED",
        },
      ],
    };

    // Get total count with search filter
    const total = await prisma.project.count({ where });

    const projects = await prisma.project.findMany({
      where,
      include: {
        location: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
