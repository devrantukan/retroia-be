import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { contentSchema } from "@/lib/validations/content";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = contentSchema.parse(body);

    const content = await prisma.contents.create({
      data: {
        key: validatedData.key,
        value: validatedData.value,
        description: validatedData.description,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("[CONTENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  try {
    const contents = await prisma.contents.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("[CONTENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
