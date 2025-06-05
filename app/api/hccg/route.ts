import { NextRequest, NextResponse } from "next/server";

interface ErrorResponse {
  error: string;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const response = await fetch(
      "https://hispark.hccg.gov.tw/OpenData/GetParkInfo",
      {
        cache: "no-store", // Disable caching for fresh data
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch parking data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage } as ErrorResponse, {
      status: 500,
    });
  }
}
