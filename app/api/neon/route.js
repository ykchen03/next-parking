import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city");
  const lon = searchParams.get("lon");
  const lat = searchParams.get("lat");
  const radius = searchParams.get("radius");
  
  const longitude = parseFloat(lon);
  const latitude = parseFloat(lat);
  const searchRadius = parseFloat(radius);
  
  if (!city || isNaN(longitude) || isNaN(latitude) || isNaN(searchRadius)) {
    return Response.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  try {
    const timestamp = new Date().toISOString();
    const data = await sql(`SELECT name, distance
    FROM ( SELECT name,
    ST_Distance(location,ST_SetSRID(ST_MakePoint(${lon},${lat}), 4326)::geography)
    AS distance FROM ${city}) AS subquery
    WHERE distance <= ${radius};`);
    return Response.json({
      data,
      timestamp,
      meta: {
        lat: latitude,
        lon: longitude,
        radius: searchRadius,
        city
      }
    }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
