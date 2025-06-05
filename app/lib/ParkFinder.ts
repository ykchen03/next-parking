import ChatBot from "./ChatBot";
function findBestParkingLot(parkingLots: any[]): any[] | null {
  const userPrefs = {
    needsRecharging: false,
    weights: {
      fullRate: 0.3,
      price: 0.1,
      distance: 0.6,
    },
  };

  const filteredLots = parkingLots.filter((lot) => {
    if (userPrefs.needsRecharging && !lot.hasRecharge) return false;

    return true;
  });

  if (filteredLots.length === 0) {
    return null;
  }

  const maxPrice = Math.max(...filteredLots.map((l) => l.price));
  const scoredLots = filteredLots.map((lot) => {
    const priceScore = maxPrice === 0 ? 1 : 1 - lot.price / maxPrice;
    const fullRateScore = 1 - lot.fullRate;
    const distanceScore = 1 - lot.distance / 1000;
    const totalScore =
      priceScore * userPrefs.weights.price +
      fullRateScore * userPrefs.weights.fullRate +
      distanceScore * userPrefs.weights.distance;

    return {
      ...lot,
      score: totalScore,
    };
  });

  scoredLots.sort((a, b) => b.score - a.score);
  return scoredLots;
}
async function query_parking_lots(
  city: string,
  lat: number,
  lon: number,
  radius: number
): Promise<any> {
  city = city.toLowerCase();
  const res = await fetch(
    `/api/neon?city=${city}&lon=${lon}&lat=${lat}&radius=${radius}`
  );
  if (!res.ok) throw new Error("Failed to fetch database data");
  const data = await res.json();
  return data;
}

interface LocationSearchArgs {
  location: string;
}

interface LocationResult {
  lat: string;
  lon: string;
  address: string;
}

async function location_search(
  args: LocationSearchArgs
): Promise<LocationResult[]> {
  console.log("locationIQ_search args:", args);
  const { location } = args;
  try {
    const result = await fetch(
      "api/location/search?location=" + encodeURIComponent(location + " Taiwan")
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
    console.log("Location result:", result);

    return [
      {
        lat: result[0].lat || "",
        lon: result[0].lon || "",
        address: result[0].display_name || "",
      },
    ];
  } catch (error) {
    console.error("Error in locationIQ_search:", error);
    throw error;
  }
}

async function address_geocoding(
  lat: number,
  lon: number
): Promise<LocationResult[]> {
  try {
    const result = await fetch(
      `api/location/search?lat=${lat}&lon=${lon}`
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
    console.log("Location result:", result);

    return [
      {
        lat: result[0].lat || "",
        lon: result[0].lon || "",
        address: result[0].display_name || "",
      },
    ];
  } catch (error) {
    console.error("Error in address_geocoding:", error);
    throw error;
  }
}

async function fetch_parking_data(parkNear: any, city: string): Promise<any> {
  const parkRealTime =
    city === "Hsinchu"
      ? await fetch("api/hccg").then((res) => res.json())
      : await fetch(`/api/tdx?city=${city}`).then((res) => res.json());
  console.log("ParkRealTime: ", parkRealTime);
  const parkData = await fetch(`data/${city.toLowerCase()}.json`).then((res) =>
    res.json()
  );

  const result = parkNear.data.map((park: any, index: number) => {
    const lot =
      city === "Hsinchu"
        ? parkRealTime.find((p: any) => p.PARKNO === park.name)
        : parkRealTime.ParkingAvailabilities.find(
            (p: any) => p.CarParkID === park.name
          );
    const pData = parkData.find((p: any) => p.id === park.name);
    const freequantity = lot?.AvailableSpaces || lot?.FREEQUANTITY || 0;
    const totalquantity = lot?.TotalSpaces || lot?.TOTALQUANTITY || 0;
    const fullRate = 1 - freequantity / totalquantity || 0;

    return {
      name: (lot?.PARKINGNAME || pData?.name) ?? "",
      address: lot?.ADDRESS ?? "",
      price: pData?.price ?? "",
      hasRecharge: pData?.recharge ?? false,
      distance: park.distance,
      fullRate: fullRate,
      lat: (lot?.LATITUDE || pData.lat) ?? null,
      lon: (lot?.LONGITUDE || pData.lon) ?? null,
      freequantity: freequantity,
      totalquantity: totalquantity,
    };
  });

  return result;
}

interface ParkingLotsFinderArgs {
  city: string;
  latitude: number;
  longitude: number;
  radius: number;
}

async function parking_lots_finder(args: ParkingLotsFinderArgs): Promise<any> {
  console.log("parking_lots_finder args:", args);
  const { city, latitude, longitude, radius } = args;
  try {
    const parkNear = await query_parking_lots(
      city,
      latitude,
      longitude,
      radius
    );
    console.log("ParkNear: ", parkNear);
    const result = await fetch_parking_data(parkNear, city);
    return findBestParkingLot(result);
  } catch (error) {
    console.error("Error in parking_lots_finder:", error);
    throw error;
  }
}

//Please found the parking lots around Hsinchu train station about 500 meters
//Please found the parking lots around Taipei 101 about 500 meters
//請找出台北101附近500公尺內的停車場

export default async function ParkFinder(
  userPrompt: string,
  gpsLocation: {
    latitude: number;
    longitude: number;
  } | null
): Promise<any> {
  const FUNCTION_SCHEMA = await fetch("data/function_schema.json").then((res) =>
    res.json()
  );
  const FUNCTION_MAP = {
    location_search: location_search,
    parking_lots_finder: parking_lots_finder,
  } as const;

  type FunctionMapKey = keyof typeof FUNCTION_MAP;
  const SYSTEM_PROMPT = [
    `You are a function-calling model for extracting geographic locations.

Your task:
1. Extract only the location name (as a clean string, in English) from user input.
2. Do not include additional context (e.g., "parking within 500 meters" — this is incorrect).
3. Call \`location_search(location: string)\` with ONLY the location name, like "Taipei 101", "Hsinchu train station", etc.

Important Rules:
- Do not generate any explanation or chat text when calling functions.
- If the input is NOT about finding parking near a location, do not call any function — instead, return a short reason to the user.
- Only one function call is allowed.
- Do not modify or interpret the user input. Extract only the place name.

Examples (Correct):
- User: "Find parking near Taipei 101"
  → Call: location_search("Taipei 101")

- User: "I need parking near Hsinchu High-Speed Rail"
  → Call: location_search("Hsinchu High-Speed Rail")

Examples (Incorrect):
- ❌ "Taipei 101 parking within 500 meters"
- ❌ "Find me lots near the train"`,

    `You are a function-calling model for searching parking lots.

Supported cities:
["Keelung", "Taipei", "Taoyuan", "Hsinchu", "Taichung", "Changhua", "Tainan", "Kaohsiung"]

Your task:
- If the location (city) is **not in the list**, return a reason to the user — do NOT call any function.
- If the location is in the list, call:

  \`parking_lots_finder(city: string, latitude: number, longitude: number, radius: number)\`

  Rules:
  1. \`city\` must exactly match one of the names in the list (case-sensitive).
  2. Use the given coordinates (latitude & longitude).
  3. Use a default \`radius\` of 500 meters if not specified by the user.

Additional:
- If the address or coordinates are missing (Location Geocoding failed), return an error message instead of calling the function.
- Do not generate or include any text response — only call the function with JSON.
- Only one function call is allowed per request.

Data is below:`,
    `You are a assistant for Searching Parking lot.
  Show the parking lots realtime information in your way.
  Show Google map direction link of the each parking lot.
  If the data is empty, mean no parking lot around the location, return the reason to user in your way.
  The parking lot data is below:`,
  ];
  let callReturn: string = "";
  let response: any;
  console.log("GPS Location:", gpsLocation);

  if (gpsLocation !== null) {
    const address = await address_geocoding(
      gpsLocation.latitude,
      gpsLocation.longitude
    );
    SYSTEM_PROMPT.shift();
    callReturn = JSON.stringify(address);
  }

  for (let i = 0; i < SYSTEM_PROMPT.length; i++) {
    console.log("Current prompt:", SYSTEM_PROMPT[i] + " " + callReturn);
    response = await ChatBot(
      "parkFinder",
      userPrompt,
      undefined,
      SYSTEM_PROMPT[i] + " " + callReturn,
      [FUNCTION_SCHEMA[i]]
    );
    console.log("Response:", response);
    const toolCalls = response?.choices?.[0]?.message?.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return response || "I can't help you with that.";
    }
    const functionCall = toolCalls[0].function;
    const functionName = functionCall.name as FunctionMapKey;
    const functionArgs = JSON.parse(functionCall.arguments);
    if (FUNCTION_MAP[functionName]) {
      callReturn = JSON.stringify(
        await FUNCTION_MAP[functionName](functionArgs)
      );
      console.log("Function call return:", callReturn);
    } else {
      throw new Error(`Function ${functionName} is not defined.`);
    }
  }
  return response;
}
