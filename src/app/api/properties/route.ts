import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Check if search term is a number
    const searchNumber = parseInt(search);
    const isNumericSearch = !isNaN(searchNumber);

    // Build where clause for both text and numeric searches
    const where: Prisma.PropertyWhereInput = {
      AND: [
        // Base condition: only published properties
        { publishingStatus: "PUBLISHED" },
        // Search conditions
        ...(search
          ? [
              {
                OR: [
                  // Text search on name
                  {
                    name: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  // ID search if search term is numeric
                  ...(isNumericSearch ? [{ id: searchNumber }] : []),
                  // Agent name search
                  {
                    agent: {
                      OR: [
                        {
                          name: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                          },
                        },
                        {
                          surname: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          status: true,
          type: true,
          agent: true,
          images: true,
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      items: properties,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
