import { NextRequest, NextResponse } from "next/server";

interface ErrorResponse {
  error: string;
}

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "http://api.openweathermap.org/data/2.5/weather";

export async function GET(
  req: NextRequest
): Promise<NextResponse<any | ErrorResponse>> {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" } as ErrorResponse,
      { status: 400 }
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Weather API key is not configured" } as ErrorResponse,
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=zh_tw`
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch weather: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Weather API error:", error);

    return NextResponse.json({ error: errorMessage } as ErrorResponse, {
      status: 500,
    });
  }
}
