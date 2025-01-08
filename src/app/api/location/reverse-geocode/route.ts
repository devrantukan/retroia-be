import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = "AIzaSyBf_hX4WicWgAHxKSjeBD29dLXjB0xm3C4";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key is missing");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=tr`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Geocoding API error:", data);
      return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
