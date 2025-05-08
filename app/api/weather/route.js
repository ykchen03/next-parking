const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const city = searchParams.get("city");
    try {
        const res = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=zh_tw`);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        return Response.json(data, { status: 200 });
        //res.status(200).json(data);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
        //return res.json({ error: error.message }, { status: 500 });
    }
};