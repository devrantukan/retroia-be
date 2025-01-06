import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
        location || ""
      )}&inputtype=textquery&fields=formatted_address,name,geometry&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return NextResponse.json(
      { error: "Failed to fetch coordinates" },
      { status: 500 }
    );
  }
}
