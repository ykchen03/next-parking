import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface ParkingLocation {
  name: string;
  distance: number;
}

interface ApiResponse {
  data: ParkingLocation[];
  timestamp: string;
  meta: {
    lat: number;
    lon: number;
    radius: number;
    city: string;
  };
}

interface ErrorResponse {
  error: string;
}

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse | ErrorResponse>> {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city") as string | null;
  const lon = searchParams.get("lon");
  const lat = searchParams.get("lat");
  const radius = searchParams.get("radius");

  // Validate and parse parameters
  const longitude = lon ? parseFloat(lon) : NaN;
  const latitude = lat ? parseFloat(lat) : NaN;
  const searchRadius = radius ? parseFloat(radius) : NaN;

  if (!city || isNaN(longitude) || isNaN(latitude) || isNaN(searchRadius)) {
    return NextResponse.json(
      { error: "Invalid query parameters" } as ErrorResponse,
      { status: 400 }
    );
  }

  try {
    const timestamp = new Date().toISOString();

    const data = (await sql`
      SELECT name, distance
      FROM (
        SELECT name,
        ST_Distance(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) AS distance
        FROM ${sql.unsafe(city)}
      ) AS subquery
      WHERE distance <= ${searchRadius}
    `) as ParkingLocation[];

    console.log("Database query result:", data);

    const response: ApiResponse = {
      data,
      timestamp,
      meta: {
        lat: latitude,
        lon: longitude,
        radius: searchRadius,
        city,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Database query failed";
    console.error("Database error:", error);

    return NextResponse.json({ error: errorMessage } as ErrorResponse, {
      status: 500,
    });
  }
}
