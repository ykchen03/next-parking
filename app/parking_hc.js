import dynamic from "next/dynamic";
import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Stack, Backdrop } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import NearMeIcon from "@mui/icons-material/NearMe";
import CircularProgress from "@mui/material/CircularProgress";
import { useQuery } from "@tanstack/react-query";
import findBestParkingLot from "./best_park";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default React.memo(function ParkingLot({ target, m_dis, needRecharge, refresh, findBest }) {
  const [hcData, setHcData] = useState(null);
  const [prev, setPrev] = useState(null);
  const [best, setBest] = useState(null);
  const [greenDot, setGreenDot] = useState(null);
  const [yellowDot, setYellowDot] = useState(null);
  const [orangeDot, setOrangeDot] = useState(null);
  const [redDot, setRedDot] = useState(null);
  const [greyDot, setGreyDot] = useState(null);
  const [goldDot, setGoldDot] = useState(null);

  useEffect(() => {
    const L = require("leaflet");
    setGreenDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-green.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );
    setYellowDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-yellow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );
    setOrangeDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-orange.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );
    setRedDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );
    setGreyDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-grey.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );
    setGoldDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-gold.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );
    fetch("data/hsinchu.json")
      .then((res) => res.json())
      .then((data) => {
        setHcData(data);
      });
  }, []);

  const {
    data: parkData,
    error: parkError,
    isLoading: parkLoading,
    refetch: refetchHC,
  } = useQuery({
    queryKey: ["parkingLots"],
    queryFn: async () => {
      console.log('fetchHC',Date().toLocaleString());
      const res = await fetch("/api/hccg");
      if (!res.ok) throw new Error("Failed to fetch parking lot data");
      return res.json();
    },
    enabled: false,
  });

  const {
    data: neonData,
    error: neonError,
    isLoading: neonLoading,
    refetch: refetchNeon,
  } = useQuery({
    queryKey: ["neonData"],
    queryFn: async () => {
      if (
        target[0] === prev?.lat &&
        target[1] === prev?.lon &&
        m_dis === prev?.dis
      ) {
        return neonData;
      }
      console.log('fetchNeon',target,Date().toLocaleString());
      const res = await fetch(`/api/neon?lon=${target[1]}&lat=${target[0]}&radius=${m_dis}`);
      //const res = await fetch("neon_test.json");
      if (!res.ok) throw new Error("Failed to fetch database data");
      setPrev({ lat: target[0], lon: target[1], dis: m_dis });
      return res.json();
    },
    enabled: false,
  });

  useEffect(() => {
    refetchHC();
    refetchNeon();
  }, [refresh]);

  useEffect(() => {
    if (!parkData || !neonData || !hcData) {
      return;
    }
    console.log('findBestParkingLot',Date().toLocaleString());
    const data_find = [];
    neonData.forEach((park) => {
      const id = park.name;
      const data = hcData?.find((p) => p.id === id);
      const lot = parkData?.find((p) => p.PARKNO === id);
      const price = data.price;
      const hasRecharge = data.recharge;
      const fullRate = (lot.TOTALQUANTITY - lot.FREEQUANTITY) / lot.TOTALQUANTITY;
      data_find.push({ id, price, hasRecharge, fullRate, distance: park.distance });
    });
    setBest(findBestParkingLot(data_find, {needsRecharging: needRecharge}));
  }, [findBest]);

  if (parkError || neonError) {
    console.error(parkError || neonError);
    return <></>;
  }

  if (parkLoading || neonLoading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  const icon = (lot) => {
    if (lot.TOTALQUANTITY === 0) return greyDot;
    else if (lot.FREEQUANTITY / lot.TOTALQUANTITY > 0.75) return redDot;
    else if (lot.FREEQUANTITY / lot.TOTALQUANTITY > 0.5) return orangeDot;
    else if (lot.FREEQUANTITY / lot.TOTALQUANTITY > 0.25)
      return yellowDot;
    else return greenDot;
  };
  const color = (rate) => {
    return `rgba(${255 * (1 - rate)}, ${255 * rate}, 0, 0.5)`;
  };

  return (
    <>
      {neonData?.map((park, index) => {
        const lot = parkData.find((p) => p.PARKNO === park.name);
        const pData = hcData.find((p) => p.id === park.name);
        const status_color = color(
          (lot.TOTALQUANTITY - lot.FREEQUANTITY) /
            lot.TOTALQUANTITY
        );
        return (
          <Marker
            key={index}
            position={[lot.LATITUDE, lot.LONGITUDE]}
            icon={best?.id === park.name ? goldDot : icon(lot)}
          >
            <Popup autoPan={false}>
              <div>
                <h2>{lot.PARKINGNAME}{pData.recharge && '⚡'}</h2>
                <p>{lot.ADDRESS}</p>
                <p>費率💵:${pData.price}/H</p>
                <p>營業時間🕒:{lot.BUSINESSHOURS}</p>
                <p>
                  剩餘車位🅿️:{lot.FREEQUANTITY}/{lot.TOTALQUANTITY}
                </p>
                {lot.TOTALQUANTITY === 0 ? null : (
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 1, md: 3 }}
                  >
                    <Button
                      aria-label="google-map-route"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lot.LATITUDE},${lot.LONGITUDE}`}
                      target="_blank"
                      variant="outlined"
                      startIcon={<NearMeIcon />}
                    >
                      路線
                    </Button>
                    <Gauge
                      width={100}
                      height={100}
                      value={lot.TOTALQUANTITY - lot.FREEQUANTITY}
                      valueMax={lot.TOTALQUANTITY}
                      sx={{
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: status_color,
                        },
                        [`& .${gaugeClasses.valueText} text`]: {
                          fontSize: 25,
                          fontWeight: "bold",
                          fill: status_color,
                        },
                      }}
                    />
                  </Stack>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
});