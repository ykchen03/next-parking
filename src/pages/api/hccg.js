export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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
    return res.status(200).json(data);
  } catch (error) {
    return res.json({ error: error.message }, { status: 500 });
  }
}
