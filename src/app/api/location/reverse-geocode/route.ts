import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const GOOGLE_MAPS_API_KEY = "AIzaSyBf_hX4WicWgAHxKSjeBD29dLXjB0xm3C4";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return new Response("Missing coordinates", { status: 400 });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key is missing");
      return new Response("Configuration error", { status: 500 });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=tr`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Geocoding API error:", data);
      return new Response("Geocoding failed", { status: 500 });
    }

    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
