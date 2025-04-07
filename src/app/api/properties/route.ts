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

    // If it's a numeric search, use raw SQL for exact ID match
    if (isNumericSearch) {
      const properties = await prisma.$queryRaw`
        SELECT p.*, 
               s.*, 
               t.*, 
               a.*, 
               json_agg(i.*) as images
        FROM "Property" p
        LEFT JOIN "PropertyStatus" s ON p."statusId" = s.id
        LEFT JOIN "PropertyType" t ON p."typeId" = t.id
        LEFT JOIN "Agent" a ON p."agentId" = a.id
        LEFT JOIN "PropertyImage" i ON p.id = i."propertyId"
        WHERE p.id = ${searchNumber}
        GROUP BY p.id, s.id, t.id, a.id
      `;

      if (properties && Array.isArray(properties) && properties.length > 0) {
        return NextResponse.json({
          items: properties,
          total: 1,
          pages: 1,
        });
      }
    }

    // If no exact ID match found, proceed with text search
    const where: Prisma.PropertyWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
        }
      : {};

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
