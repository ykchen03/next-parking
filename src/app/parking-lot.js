import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function ParkingLot({lat, lon, dis}) {
  const [res, setRes] = useState([]);
  const [error, setError] = useState(null);
  const [prevLoc, setPrevLoc] = useState([]);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await fetch(`/api/tdx?lat=${lat}&lon=${lon}&dis=${dis}`);
        if (!response.ok) {
          throw new Error("Failed to fetch parking lot data");
        }
        const data = await response.json();
        setPrevLoc([lat, lon]);
        setRes(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (res.length === 0 || prevLoc[0] !== lat || prevLoc[1] !== lon)
        fetchParkingLots();
  }, [lat,lon,dis]);

  if (error) {
    console.error(error);
    return <></>;
  }

  return (
    <>
      {res.map((park, index) => (
        <Marker key={index} position={[park.CarParkPosition.PositionLat, park.CarParkPosition.PositionLon]}>
          <Popup>
            <div>
              <h2>{park.CarParkName.Zh_tw}</h2>
              <p>{park.Address}</p>
              <p>{park.Description}</p>
              <p>{park.FareDescription}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};