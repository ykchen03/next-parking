let cachedToken = null;
let tokenExpiration = null;

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { lat, lon, dis } = req.query;

    if (!lat || !lon || !dis) {
        return res.status(400).json({ error: "Missing required query parameters: lat, lon, dis" });
    }

    try {
        if (!cachedToken || Date.now() >= tokenExpiration) {
            const authResponse = await fetch("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept-Encoding": "br,gzip",
                },
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                    client_id: process.env.TDX_CLIENT_ID,
                    client_secret: process.env.TDX_CLIENT_SECRET,
                }),
            });

            const authData = await authResponse.json();
            if (!authData.access_token) {
                return res.status(500).json({ error: "Failed to get access token" });
            }

            cachedToken = authData.access_token;
            tokenExpiration = Date.now() + (authData.expires_in * 1000);
        }

        const Res = await fetch(`https://tdx.transportdata.tw/api/advanced/v1/Parking/OffStreet/CarPark/NearBy?%24spatialFilter=nearby%28${lat}%2C%20${lon}%2C%20${dis}%29&%24format=JSON`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${cachedToken}`,
                "Accept-Encoding": "br,gzip",
            },
        });
        //console.log(Res);
        const Data = await Res.json();

        res.status(200).json(Data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}