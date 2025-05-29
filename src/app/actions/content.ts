import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getContents(page: number = 1, search: string = "") {
  try {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { key: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { value: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [contents, total] = await Promise.all([
      prisma.contents.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.contents.count({ where }),
    ]);

    return {
      success: true,
      data: contents,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("[GET_CONTENTS]", error);
    return {
      success: false,
      error: "Failed to fetch contents",
    };
  }
}
