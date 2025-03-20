import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  //const { lon, lat, radius } = req.query;
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city");
  const lon = searchParams.get("lon");
  const lat = searchParams.get("lat");
  const radius = searchParams.get("radius");
  
  const longitude = parseFloat(lon);
  const latitude = parseFloat(lat);
  const searchRadius = parseFloat(radius);
  console.log(`
    SELECT name, distance
    FROM ( SELECT name,
            ST_Distance(location,ST_SetSRID(ST_MakePoint(${lon},${lat}), 4326)::geography)
            AS distance FROM ${city}) AS subquery
    WHERE distance <= ${radius};
    `);
  
  if (!city || isNaN(longitude) || isNaN(latitude) || isNaN(searchRadius)) {
    return Response.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  try {
    const data = await sql(`SELECT name, distance
    FROM ( SELECT name,
            ST_Distance(location,ST_SetSRID(ST_MakePoint(${lon},${lat}), 4326)::geography)
            AS distance FROM ${city}) AS subquery
    WHERE distance <= ${radius};`);
    
    return Response.json(data, { status: 200 });
    //return res.status(200).json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
    //return res.json({ error: error.message }, { status: 500 });
  }
}
