import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

export default function ParkingLot({lat, lon, dis}) {
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState([]);
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
    if (!res || prevLoc[0] !== lat || prevLoc[1] !== lon)
        fetchParkingLots();
  }, [lat,lon,dis]);

  useEffect(() => {
    if (res) {
        setCoords(res.map((lot) => lot.CarParkPosition));
    }
  }, [res]);

  if (error) {
    console.error(error);
    return <></>;
  }

  return (
    <>
      {coords.map((coord, index) => (
        <Marker key={index} position={[coord.PositionLat, coord.PositionLon]} />
      ))}
    </>
  );
};