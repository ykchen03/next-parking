import type { NextRequest } from "next/server";
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get("lat") || 0;
    const lon = searchParams.get("lon") || 0;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    ).then((res) => res.json());
    return Response.json(res, { status: 200 });
  } catch (error) {
    console.error("Error in locationIQ_search:", error);
    return Response.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
