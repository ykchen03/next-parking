import dynamic from "next/dynamic";
import React from "react";
import { useEffect, useState } from "react";
import { Button, Stack, Backdrop, Alert, Snackbar, Fade, List, ListItem, ListItemText, ListItemIcon, Box } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import NearMeIcon from "@mui/icons-material/NearMe";
import UpdateIcon from '@mui/icons-material/Update';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RemoveIcon from '@mui/icons-material/Remove';
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

export default React.memo(function ParkingLot({ target, m_dis, needRecharge, refresh, /*findBest*/ weight={}, setData }) {
  const [hcData, setHcData] = useState(null);
  const [prev, setPrev] = useState(null);
  const [future30, setFuture30] = useState({});
  const [future60, setFuture60] = useState({});
  const [greenDot, setGreenDot] = useState(null);
  const [yellowDot, setYellowDot] = useState(null);
  const [orangeDot, setOrangeDot] = useState(null);
  const [redDot, setRedDot] = useState(null);
  const [greyDot, setGreyDot] = useState(null);
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
    fetch("data/hsinchu.json")
      .then((res) => res.json())
      .then((data) => {
        setHcData(data);
      });
  }, []);

  const forecast = async (id, current_ava) => {
    try {
      console.log('forecast',id,Date().toLocaleString());
      const res = await fetch(`https://parking-forecast.onrender.com/api/forecast?id=${id}&current_ava=${current_ava}`);
      if (!res.ok) throw new Error("Failed to fetch forecast data");
      const data = await res.json();
      console.log(data);
      setFuture30((prev) => ({
        ...prev,
        [id]: data.forecasts[0].trend,
      }));
      setFuture60((prev) => ({
        ...prev,
        [id]: data.forecasts[1].trend,
      }));
    } catch (error) {
      console.error(error);
    }
  };

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
      const res = await fetch(`/api/neon?city=hsinchu&lon=${target[1]}&lat=${target[0]}&radius=${m_dis}`);
      //const res = await fetch("neon_test_hc.json");
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
    neonData.data.forEach((park) => {
      const id = park.name;
      const data = hcData?.find((p) => p.id === id);
      const lot = parkData?.find((p) => p.PARKNO === id);
      const name = lot.PARKINGNAME;
      const price = data.price;
      const hasRecharge = data.recharge;
      const fullRate = 1 - (lot.FREEQUANTITY / lot.TOTALQUANTITY);
      data_find.push({ id, name, price, hasRecharge, fullRate, distance: park.distance, position: [lot.LATITUDE, lot.LONGITUDE ] });
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

  const icon = (lot) => {
    if (lot.TOTALQUANTITY === 0) return greyDot;
    const ratio = lot.FREEQUANTITY / lot.TOTALQUANTITY;
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
        const lot = parkData.find((p) => p.PARKNO === park.name);
        const pData = hcData.find((p) => p.id === park.name);
        const status_color = color(
          lot.FREEQUANTITY /
            lot.TOTALQUANTITY
        );
        return (
          <Marker
            key={index}
            position={[lot.LATITUDE, lot.LONGITUDE]}
            icon={icon(lot)}
          >
            <Popup autoPan={false}>
              <div>
                <h2 className="text-2xl font-bold">{lot.PARKINGNAME}{pData.recharge && '⚡'}</h2>
                <p>{lot.ADDRESS}</p>
                <p>費率💵:${pData.price}/H</p>
                <p>營業時間🕒:{lot.BUSINESSHOURS}</p>
                <p className="font-bold" style={{ color: status_color }}>
                  剩餘車位🅿️:{lot.FREEQUANTITY}/{lot.TOTALQUANTITY}
                </p>
                {lot.TOTALQUANTITY === 0 ? null : (
                  <Box className="flex flex-col gap-2">
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
                        value={lot.FREEQUANTITY}
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
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={{ xs: 1, md: 3 }}
                    >
                      <Button
                        aria-label="forecast"
                        onClick={() => forecast(lot.PARKNO, lot.FREEQUANTITY)}
                        variant="outlined"
                        startIcon={<UpdateIcon />}
                      >
                        預測
                      </Button>
                      {future30[lot.PARKNO] !== undefined && future60[lot.PARKNO] !== undefined && (
                        <List dense={true}>
                          <ListItem disablePadding>
                            <ListItemText
                              primary={`30分鐘後`}
                            />
                            <ListItemIcon>
                              {future30[lot.PARKNO] === "fuller" ? <ArrowDropUpIcon color="error"/> : future30[lot.PARKNO] === "emptier" ? <ArrowDropDownIcon color="success"/> : <RemoveIcon/>}
                            </ListItemIcon>
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText
                              primary={`60分鐘後`}
                            />
                            <ListItemIcon>
                              {future60[lot.PARKNO] === "fuller" ? <ArrowDropUpIcon color="error"/> : future60[lot.PARKNO] === "emptier" ? <ArrowDropDownIcon color="success"/> : <RemoveIcon/>}
                            </ListItemIcon>
                          </ListItem>
                        </List>
                      )}
                    </Stack>
                  </Box>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
});