export async function GET(req) {
  try {
    const response = await fetch(
      "https://hispark.hccg.gov.tw/OpenData/GetParkInfo",
      {
        cache: "no-store", // Disable caching for fresh data
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch parking data");
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
    //res.status(200).json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
    //return res.json({ error: error.message }, { status: 500 });
  }
}
