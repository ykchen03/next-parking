import dynamic from "next/dynamic";
import React from "react";
import { useEffect, useState } from "react";
import { Button, Stack, Backdrop, Alert, Snackbar, Fade } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import NearMeIcon from "@mui/icons-material/NearMe";
import CircularProgress from "@mui/material/CircularProgress";
import { useQuery } from "@tanstack/react-query";
import findBestParkingLot from "../lib/best_park";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default React.memo(function ParkingLot({ city, target, m_dis, needRecharge, refresh, /*findBest,*/ weight={}, setData }) {
  const [tdxData, setTdxData] = useState(null);
  const [prev, setPrev] = useState(null);
  //const [best, setBest] = useState(null);
  const [greenDot, setGreenDot] = useState(null);
  const [yellowDot, setYellowDot] = useState(null);
  const [orangeDot, setOrangeDot] = useState(null);
  const [redDot, setRedDot] = useState(null);
  const [greyDot, setGreyDot] = useState(null);
  //const [goldDot, setGoldDot] = useState(null);
  const [open, setOpen] = useState(false);

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
    /*setGoldDot(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/refs/heads/master/img/marker-icon-gold.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    );*/
    fetch(`data/${city}.json`)
      .then((res) => res.json())
      .then((data) => {
        setTdxData(data);
      });
  }, []);

  const {
    data: parkData,
    error: parkError,
    isLoading: parkLoading,
    refetch: refetchTDX,
  } = useQuery({
    queryKey: ["parkingLots"],
    queryFn: async () => {
      console.log('fetchTDX',Date().toLocaleString());
      const res = await fetch(`/api/tdx?city=${city.charAt(0).toUpperCase() + city.slice(1)}`);
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
      const res = await fetch(`/api/neon?city=${city}&lon=${target[1]}&lat=${target[0]}&radius=${m_dis}`);
      //const res = await fetch("neon_test_kee.json");
      if (!res.ok) throw new Error("Failed to fetch database data");
      setPrev({ lat: target[0], lon: target[1], dis: m_dis });
      return res.json();
    },
    enabled: false,
  });

  useEffect(() => {
    refetchTDX();
    refetchNeon();
  }, [refresh]);

  useEffect(() => {
    if (!parkData || !neonData || !tdxData) {
      return;
    }
    console.log('findBestParkingLot',Date().toLocaleString());
    const data_find = [];
    neonData.data.forEach((park) => {
      const id = park.name;
      const data = tdxData?.find((p) => p.id === id);
      const lot = parkData.ParkingAvailabilities.find((p) => p.CarParkID === park.name);
      const FREEQUANTITY = lot?.AvailableSpaces;
      const TOTALQUANTITY = lot?.TotalSpaces;
      const name = data.name;
      const price = data.price;
      const hasRecharge = data.recharge;
      const fullRate = 1 - (FREEQUANTITY / TOTALQUANTITY);
      data_find.push({ id, name, price, hasRecharge, fullRate, distance: park.distance, position: [data.lat, data.lon ] });
    });
    const bestLots = findBestParkingLot(data_find, {needsRecharging: needRecharge, weights: weight});
    //setBest(bestLots[0]);
    setData(bestLots);
  }, [neonData, parkData, needRecharge]);

  useEffect(() => {
    if (neonData?.data.length === 0) {
      setOpen(true);
    }
  }, [neonData]);

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

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') 
      return;
    setOpen(false);
  };
  
  if (neonData?.data.length === 0) {
    return <Snackbar 
      open={open} 
      autoHideDuration={5000}
      slots={{ transition: Fade }}
      onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          No parking lot found
        </Alert>
      </Snackbar>
  }
  //console.log(neonData);

  const icon = (FREEQUANTITY,TOTALQUANTITY) => {
    if (TOTALQUANTITY === 0) return greyDot;
    const ratio = FREEQUANTITY / TOTALQUANTITY;
    return ratio > 0.75 ? greenDot 
         : ratio > 0.5  ? yellowDot 
         : ratio > 0.25 ? orangeDot 
                        : redDot;
  };
  const color = (rate) => {
    return `rgba(${255 * (1 - rate)}, ${255 * (rate)}, 0, 0.5)`;
  };

  return (
    <>
      {neonData?.data.map((park, index) => {
        const lot = parkData.ParkingAvailabilities.find((p) => p.CarParkID === park.name);
        const FREEQUANTITY = lot?.AvailableSpaces;
        const TOTALQUANTITY = lot?.TotalSpaces;
        const pData = tdxData.find((p) => p.id === park.name);
        const status_color = color(FREEQUANTITY / TOTALQUANTITY);
        return (
          <Marker
            key={index}
            position={[pData.lat, pData.lon]}
            icon={icon(FREEQUANTITY,TOTALQUANTITY)}
          >
            <Popup autoPan={false}>
              <div>
                <h2 className="text-2xl font-bold">{pData.name}{pData.recharge && '⚡'}</h2>
                <p>費率💵:${pData.price}/H</p>
                <p className="font-bold" style={{ color: status_color }}>
                  剩餘車位🅿️:{FREEQUANTITY}/{TOTALQUANTITY}
                </p>
                {TOTALQUANTITY === 0 ? null : (
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 1, md: 3 }}
                  >
                    <Button
                      aria-label="google-map-route"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pData.lat},${pData.lon}`}
                      target="_blank"
                      variant="outlined"
                      startIcon={<NearMeIcon />}
                    >
                      路線
                    </Button>
                    <Gauge
                      width={100}
                      height={100}
                      value={FREEQUANTITY}
                      valueMax={TOTALQUANTITY}
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