import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ErrorResponse {
  error: string;
}

// Cache variables with proper typing
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

export async function GET(
  req: NextRequest
): Promise<NextResponse<any | ErrorResponse>> {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city") as string | null;

  if (!city) {
    return NextResponse.json(
      { error: "Invalid query parameters" } as ErrorResponse,
      { status: 400 }
    );
  }

  try {
    // Check if token needs refresh
    if (!cachedToken || !tokenExpiration || Date.now() >= tokenExpiration) {
      const authResponse = await fetch(
        "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Encoding": "br,gzip",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.TDX_CLIENT_ID!,
            client_secret: process.env.TDX_CLIENT_SECRET!,
          }),
        }
      );

      if (!authResponse.ok) {
        throw new Error(
          `Authentication failed: ${authResponse.status} ${authResponse.statusText}`
        );
      }

      const authData: AuthResponse = await authResponse.json();

      if (!authData.access_token) {
        return NextResponse.json(
          { error: "Failed to get access token" } as ErrorResponse,
          { status: 500 }
        );
      }

      cachedToken = authData.access_token;
      tokenExpiration = Date.now() + authData.expires_in * 1000;
    }

    // Fetch parking data
    const dataResponse = await fetch(
      `https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/ParkingAvailability/City/${city}?%24select=CarParkID%2CAvailableSpaces%2CTotalSpaces&%24format=JSON`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          "Accept-Encoding": "br,gzip",
        },
      }
    );

    if (!dataResponse.ok) {
      throw new Error(
        `TDX API request failed: ${dataResponse.status} ${dataResponse.statusText}`
      );
    }

    const data = await dataResponse.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error fetching TDX data:", error);

    return NextResponse.json({ error: errorMessage } as ErrorResponse, {
      status: 500,
    });
  }
}
