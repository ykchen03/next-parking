import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import NearMeIcon from "@mui/icons-material/NearMe";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function ParkingLot({ u_lat, u_lon, m_dis }) {
  const [parkData, setParkData] = useState([]);
  const [neonData, setNeonData] = useState([]);
  const [error, setError] = useState(null);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response_park = await fetch("/api/hccg");
        if (!response_park.ok) {
          throw new Error("Failed to fetch parking lot data");
        }
        const park_data = await response_park.json();
        setParkData(park_data);
        //console.log(park_data);

        if (
          u_lat === prev?.u_lat &&
          u_lon === prev?.u_lon &&
          m_dis === prev?.m_dis
        ) {
          return;
        }

        const response_neon = await fetch(
          `/api/neon?lon=${u_lon}&lat=${u_lat}&radius=${m_dis}`
        );
        if (!response_neon.ok) {
          throw new Error("Failed to fetch database data");
        }
        const neon_data = await response_neon.json();
        setNeonData(neon_data);
        //console.log(neon_data);

        setPrev({ u_lat, u_lon, m_dis });
      } catch (err) {
        setError(err.message);
        console.error(err);
      }
    };

    fetchParkingLots();
  }, [u_lat, u_lon, m_dis]);

  if (error) {
    console.error(error);
    return <></>;
  }

  return (
    <>
      {neonData.map((park, index) => {
        const lot = parkData.find((p) => p.PARKNO === park.name);
        return (
          <Marker key={index} position={[lot.LATITUDE, lot.LONGITUDE]}>
            <Popup>
              <div>
                <h2>{lot.PARKINGNAME}</h2>
                <p>{lot.ADDRESS}</p>
                <p>{lot.HOLIDAY}</p>
                <p>充電車位⚡:{lot.TOTALQUANTITYECAR}</p>
                <p>
                  剩餘車位🅿️:{lot.FREEQUANTITY}/{lot.TOTALQUANTITY}
                </p>
                <IconButton
                  color="primary"
                  aria-label="google-map-route"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lot.LATITUDE},${lot.LONGITUDE}`}
                  target="_blank"
                >
                  <NearMeIcon />
                </IconButton>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
