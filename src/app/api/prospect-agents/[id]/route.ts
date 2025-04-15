import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid prospect agent ID" },
        { status: 400 }
      );
    }

    await prisma.prospectAgent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prospect agent:", error);
    return NextResponse.json(
      { error: "Failed to delete prospect agent" },
      { status: 500 }
    );
  }
}
