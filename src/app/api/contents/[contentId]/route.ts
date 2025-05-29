import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { contentSchema } from "@/lib/validations/content";

export async function PATCH(
  req: Request,
  { params }: { params: { contentId: string } }
) {
  try {
    const body = await req.json();
    const validatedData = contentSchema.parse(body);

    const content = await prisma.contents.update({
      where: {
        id: parseInt(params.contentId),
      },
      data: {
        key: validatedData.key,
        value: validatedData.value,
        description: validatedData.description,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("[CONTENT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { contentId: string } }
) {
  try {
    await prisma.contents.delete({
      where: {
        id: parseInt(params.contentId),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CONTENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
