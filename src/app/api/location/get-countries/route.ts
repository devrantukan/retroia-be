import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  try {
    const countries = await prisma.country.findMany({
      orderBy: {
        country_name: "asc",
      },
    });

    return new Response(JSON.stringify(countries), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
