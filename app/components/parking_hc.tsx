import dynamic from "next/dynamic";
import React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Stack,
  Backdrop,
  Alert,
  Snackbar,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
} from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import NearMeIcon from "@mui/icons-material/NearMe";
import UpdateIcon from "@mui/icons-material/Update";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RemoveIcon from "@mui/icons-material/Remove";
import CircularProgress from "@mui/material/CircularProgress";
import findBestParkingLot from "../lib/best_park";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

type LatLng = [number, number];

type Weight = {
  fullRate: number;
  price: number;
  distance: number;
};

type ParkingLot = {
  PARKNO: string;
  PARKINGNAME: string;
  ADDRESS: string;
  BUSINESSHOURS: string;
  FREEQUANTITY: number;
  TOTALQUANTITY: number;
  LATITUDE: number;
  LONGITUDE: number;
};

type HcData = {
  id: string;
  price: number;
  recharge: boolean;
};

type NeonData = {
  data: Array<{
    name: string;
    distance: number;
  }>;
};

type ForecastData = {
  trend: "fuller" | "emptier" | "stable";
  percent: number;
};

type ParkingLotProps = {
  target: LatLng;
  m_dis: number;
  needRecharge: boolean;
  refresh: boolean;
  weight: Weight;
  setData: (data: any) => void;
};

type PrevState = {
  lat: number;
  lon: number;
  dis: number;
};

export default React.memo(function ParkingLot({
  target,
  m_dis,
  needRecharge,
  refresh,
  weight = { fullRate: 0.3, price: 0.1, distance: 0.6 },
  setData,
}: ParkingLotProps) {
  const [hcData, setHcData] = useState<HcData[] | null>(null);
  const [prev, setPrev] = useState<PrevState | null>(null);
  const [future30, setFuture30] = useState<Record<string, ForecastData>>({});
  const [future60, setFuture60] = useState<Record<string, ForecastData>>({});
  const [greenDot, setGreenDot] = useState<any>(null);
  const [yellowDot, setYellowDot] = useState<any>(null);
  const [orangeDot, setOrangeDot] = useState<any>(null);
  const [redDot, setRedDot] = useState<any>(null);
  const [greyDot, setGreyDot] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [neonData, setNeonData] = useState<NeonData | null>(null);
  const [parkData, setParkData] = useState<ParkingLot[] | null>(null);

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
      .then((data: HcData[]) => {
        setHcData(data);
      });
  }, []);

  const forecast = async (
    id: string,
    current_ava: number,
    total: number
  ): Promise<void> => {
    try {
      console.log("forecast", id, new Date().toLocaleString());
      const res = await fetch(
        (process.env.NODE_ENV === "production"
          ? "https://parking-forecast.onrender.com"
          : "http://localhost:10000") +
          `/api/forecast?park_id=${id}&current_free_spaces=${current_ava}`
      );
      if (!res.ok) throw new Error("Failed to fetch forecast data");
      const data = await res.json();
      console.log(data);
      setFuture30((prev) => ({
        ...prev,
        [id]: {
          trend: data.trend30,
          percent: Math.round((data.change30 / total) * 100),
        },
      }));
      setFuture60((prev) => ({
        ...prev,
        [id]: {
          trend: data.trend60,
          percent: Math.round((data.change60 / total) * 100),
        },
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const refetchHC = async (): Promise<ParkingLot[]> => {
    console.log("fetchHC", new Date().toLocaleString());
    const res = await fetch("/api/hccg");
    if (!res.ok) throw new Error("Failed to fetch parking lot data");
    return res.json();
  };

  const refetchNeon = async (): Promise<NeonData> => {
    if (
      target[0] === prev?.lat &&
      target[1] === prev?.lon &&
      m_dis === prev?.dis
    ) {
      return neonData as NeonData;
    }
    console.log("fetchNeon", target, new Date().toLocaleString());
    const res = await fetch(
      process.env.NODE_ENV === "production"
        ? `/api/neon?city=hsinchu&lon=${target[1]}&lat=${target[0]}&radius=${m_dis}`
        : "neon_test_hc.json"
    );
    if (!res.ok) throw new Error("Failed to fetch database data");
    setPrev({ lat: target[0], lon: target[1], dis: m_dis });
    return res.json();
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        const pdata = await refetchHC();
        const ndata = await refetchNeon();
        setParkData(pdata);
        setNeonData(ndata);
      } catch (error) {
        throw new Error(error as string);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh, target, m_dis]);

  useEffect(() => {
    if (!parkData || !neonData || !hcData) {
      return;
    }
    console.log("findBestParkingLot", new Date().toLocaleString());
    const data_find: any[] = [];
    neonData.data.forEach((park) => {
      const id = park.name;
      const data = hcData?.find((p) => p.id === id);
      const lot = parkData?.find((p) => p.PARKNO === id);
      if (!data || !lot) return;

      const name = lot.PARKINGNAME;
      const price = data.price;
      const hasRecharge = data.recharge;
      const fullRate = 1 - lot.FREEQUANTITY / lot.TOTALQUANTITY;
      data_find.push({
        id,
        name,
        price,
        hasRecharge,
        fullRate,
        distance: park.distance,
        position: [lot.LATITUDE, lot.LONGITUDE],
      });
    });
    const bestLots = findBestParkingLot(data_find, {
      needsRecharging: needRecharge,
      weights: weight,
    });
    setData(bestLots);
  }, [neonData, parkData, needRecharge, hcData, weight, setData]);

  useEffect(() => {
    if (neonData?.data.length === 0) {
      setOpen(true);
    }
  }, [neonData]);

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  if (neonData?.data.length === 0) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={5000}
        slots={{ transition: Fade }}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          No parking lot found
        </Alert>
      </Snackbar>
    );
  }

  const icon = (lot: ParkingLot) => {
    if (lot.TOTALQUANTITY === 0) return greyDot;
    const ratio = lot.FREEQUANTITY / lot.TOTALQUANTITY;
    return ratio > 0.75
      ? greenDot
      : ratio > 0.5
      ? yellowDot
      : ratio > 0.25
      ? orangeDot
      : redDot;
  };

  const color = (rate: number): string => {
    return `rgba(${255 * (1 - rate)}, ${255 * rate}, 0, 0.5)`;
  };

  if (!neonData || !parkData || !hcData) return null;

  return (
    <>
      {neonData.data.map((park, index) => {
        const lot = parkData.find((p) => p.PARKNO === park.name);
        const pData = hcData.find((p) => p.id === park.name);

        if (!lot || !pData) return null;

        const status_color = color(lot.FREEQUANTITY / lot.TOTALQUANTITY);
        return (
          <Marker
            key={index}
            position={[lot.LATITUDE, lot.LONGITUDE]}
            // @ts-ignore
            icon={icon(lot)}
          >
            <Popup
              // @ts-ignore
              autoPan={false}
            >
              <div>
                <h2 className="text-2xl font-bold">
                  {lot.PARKINGNAME}
                  {pData.recharge && "⚡"}
                </h2>
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
                        onClick={() =>
                          forecast(
                            lot.PARKNO,
                            lot.FREEQUANTITY,
                            lot.TOTALQUANTITY
                          )
                        }
                        variant="outlined"
                        startIcon={<UpdateIcon />}
                      >
                        預測
                      </Button>
                      {future30[lot.PARKNO] !== undefined &&
                        future60[lot.PARKNO] !== undefined && (
                          <List dense={true}>
                            <ListItem disablePadding>
                              <ListItemText
                                primary={
                                  <Typography className="m-0!">
                                    30分鐘後
                                  </Typography>
                                }
                              />
                              <ListItemIcon>
                                {future30[lot.PARKNO]["trend"] === "fuller" ? (
                                  <ArrowDropDownIcon color="error" />
                                ) : future30[lot.PARKNO]["trend"] ===
                                  "emptier" ? (
                                  <ArrowDropUpIcon color="success" />
                                ) : (
                                  <RemoveIcon />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                disableTypography
                                primary={
                                  <Typography
                                    className="m-0!"
                                    color={
                                      future30[lot.PARKNO]["percent"] > 0
                                        ? "success"
                                        : future30[lot.PARKNO]["percent"] < 0
                                        ? "error"
                                        : ""
                                    }
                                  >
                                    {future30[lot.PARKNO]["percent"]}%
                                  </Typography>
                                }
                              />
                            </ListItem>
                            <ListItem disablePadding>
                              <ListItemText
                                primary={
                                  <Typography className="m-0!">
                                    60分鐘後
                                  </Typography>
                                }
                              />
                              <ListItemIcon>
                                {future60[lot.PARKNO]["trend"] === "fuller" ? (
                                  <ArrowDropDownIcon color="error" />
                                ) : future60[lot.PARKNO]["trend"] ===
                                  "emptier" ? (
                                  <ArrowDropUpIcon color="success" />
                                ) : (
                                  <RemoveIcon />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                disableTypography
                                primary={
                                  <Typography
                                    className="m-0!"
                                    color={
                                      future60[lot.PARKNO]["percent"] > 0
                                        ? "success"
                                        : future60[lot.PARKNO]["percent"] < 0
                                        ? "error"
                                        : ""
                                    }
                                  >
                                    {future60[lot.PARKNO]["percent"]}%
                                  </Typography>
                                }
                              />
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
