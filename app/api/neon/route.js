import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const lon = searchParams.get('lon');
  const lat = searchParams.get('lat');
  const radius = searchParams.get('radius');
  
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
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
