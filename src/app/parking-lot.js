import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
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
  
  const [greenDot, setGreenDot] = useState(null);
  const [yellowDot, setYellowDot] = useState(null);
  const [orangeDot, setOrangeDot] = useState(null);
  const [redDot, setRedDot] = useState(null);
  const [greyDot, setGreyDot] = useState(null);

  useEffect(() => {
    const L = require("leaflet");
    setGreenDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-green.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    );
    setYellowDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-yellow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    );
    setOrangeDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-orange.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    );
    setRedDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    );
    setGreyDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-grey.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    );
  },[]);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response_park = await fetch("/api/hccg");
        if (!response_park.ok) {
          throw new Error("Failed to fetch parking lot data");
        }
        const park_data = await response_park.json();
        setParkData(park_data);

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
        const icon = () => {
          if (lot.TOTALQUANTITY === 0) 
            return greyDot;
          else if (lot.FREEQUANTITY / lot.TOTALQUANTITY > 0.75)
            return redDot;
          else if (lot.FREEQUANTITY / lot.TOTALQUANTITY > 0.5)
            return orangeDot;
          else if (lot.FREEQUANTITY / lot.TOTALQUANTITY > 0.25)
            return yellowDot;
          else
            return greenDot;
        };
        return (
          <Marker key={index} position={[lot.LATITUDE, lot.LONGITUDE]} icon={icon()}>
            <Popup>
              <div>
                <h2>{lot.PARKINGNAME}</h2>
                <p>{lot.ADDRESS}</p>
                <p>{lot.HOLIDAY}</p>
                <p>充電車位⚡:{lot.TOTALQUANTITYECAR}</p>
                <p>
                  剩餘車位🅿️:{lot.FREEQUANTITY}/{lot.TOTALQUANTITY}
                </p>
                <Button
                  color="primary"
                  aria-label="google-map-route"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lot.LATITUDE},${lot.LONGITUDE}`}
                  target="_blank"
                  startIcon={<NearMeIcon />}
                >
                  路線
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
