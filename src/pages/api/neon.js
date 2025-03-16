import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { lon, lat, radius } = req.query;
  
  const longitude = parseFloat(lon);
  const latitude = parseFloat(lat);
  const searchRadius = parseFloat(radius);
  
  if (isNaN(longitude) || isNaN(latitude) || isNaN(searchRadius)) {
    return res.status(400).json({ 
      error: "Invalid parameters. lon, lat, and radius must be valid numbers" 
    });
  }

  try {
    const data = await sql`
    SELECT name, distance
    FROM ( SELECT name,
            ST_Distance(location,ST_SetSRID(ST_MakePoint(${lon},${lat}), 4326)::geography)
            AS distance FROM parking_lots) AS subquery
    WHERE distance <= ${radius};
    `;
    return res.status(200).json(data);
  } catch (error) {
    return res.json({ error: error.message }, { status: 500 });
  }
}
