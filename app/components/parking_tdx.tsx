import dynamic from "next/dynamic";
import React from "react";
import { useEffect, useState } from "react";
import { Button, Stack, Backdrop, Alert, Snackbar, Fade } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import NearMeIcon from "@mui/icons-material/NearMe";
import CircularProgress from "@mui/material/CircularProgress";
import findBestParkingLot from "../lib/best_park";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Type definitions
type Position = [number, number];

type CityName =
  | "keelung"
  | "taipei"
  | "taoyuan"
  | "taichung"
  | "changhua"
  | "yunlin"
  | "tainan"
  | "kaohsiung"
  | "pingtung"
  | "yilan"
  | "hualien"
  | "taitung"
  | "kinmen";

type Weight = {
  fullRate: number;
  price: number;
  distance: number;
};

interface ParkingLotData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  price: number;
  recharge: boolean;
}

interface NeonParkData {
  name: string;
  distance: number;
}

interface NeonResponse {
  data: NeonParkData[];
}

interface ParkingAvailability {
  CarParkID: string;
  AvailableSpaces: number;
  TotalSpaces: number;
}

interface ParkDataResponse {
  ParkingAvailabilities: ParkingAvailability[];
}

interface BestParkingLot {
  id: string;
  name: string;
  price: number;
  hasRecharge: boolean;
  fullRate: number;
  distance: number;
  position: Position;
}

interface PrevState {
  lat: number;
  lon: number;
  dis: number;
}

interface ParkingLotProps {
  city: CityName;
  target: Position;
  m_dis: number;
  needRecharge: boolean;
  refresh: boolean;
  weight: Weight;
  setData: (data: BestParkingLot[] | null) => void;
}

export default React.memo(function ParkingLot({
  city,
  target,
  m_dis,
  needRecharge,
  refresh,
  weight = { fullRate: 0.3, price: 0.1, distance: 0.6 },
  setData,
}: ParkingLotProps): React.JSX.Element {
  const [tdxData, setTdxData] = useState<ParkingLotData[] | null>(null);
  const [prev, setPrev] = useState<PrevState | null>(null);
  const [greenDot, setGreenDot] = useState<any | null>(null);
  const [yellowDot, setYellowDot] = useState<any | null>(null);
  const [orangeDot, setOrangeDot] = useState<any | null>(null);
  const [redDot, setRedDot] = useState<any | null>(null);
  const [greyDot, setGreyDot] = useState<any | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [neonData, setNeonData] = useState<NeonResponse | null>(null);
  const [parkData, setParkData] = useState<ParkDataResponse | null>(null);

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

    fetch(`data/${city}.json`)
      .then((res: Response) => res.json())
      .then((data: ParkingLotData[]) => {
        setTdxData(data);
      });
  }, [city]);

  const refetchTDX = async (): Promise<ParkDataResponse> => {
    console.log("fetchTDX", new Date().toLocaleString());
    const res = await fetch(
      `/api/tdx?city=${city.charAt(0).toUpperCase() + city.slice(1)}`
    );
    if (!res.ok) throw new Error("Failed to fetch parking lot data");
    return res.json();
  };

  const refetchNeon = async (): Promise<NeonResponse> => {
    if (
      target[0] === prev?.lat &&
      target[1] === prev?.lon &&
      m_dis === prev?.dis
    ) {
      return neonData!;
    }
    console.log("fetchNeon", target, new Date().toLocaleString());
    const res = await fetch(
      `/api/neon?city=${city}&lon=${target[1]}&lat=${target[0]}&radius=${m_dis}`
    );
    if (!res.ok) throw new Error("Failed to fetch database data");
    setPrev({ lat: target[0], lon: target[1], dis: m_dis });
    return res.json();
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const pdata = await refetchTDX();
        const ndata = await refetchNeon();
        setParkData(pdata);
        setNeonData(ndata);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh, target, m_dis]);

  useEffect(() => {
    if (!parkData || !neonData || !tdxData) {
      return;
    }
    console.log("findBestParkingLot", new Date().toLocaleString());
    const data_find: BestParkingLot[] = [];

    neonData.data.forEach((park: NeonParkData) => {
      const id = park.name;
      const data = tdxData?.find((p: ParkingLotData) => p.id === id);
      const lot = parkData.ParkingAvailabilities.find(
        (p: ParkingAvailability) => p.CarParkID === park.name
      );

      if (!data || !lot) return;

      const FREEQUANTITY = lot.AvailableSpaces;
      const TOTALQUANTITY = lot.TotalSpaces;
      const name = data.name;
      const price = data.price;
      const hasRecharge = data.recharge;
      const fullRate = TOTALQUANTITY > 0 ? 1 - FREEQUANTITY / TOTALQUANTITY : 1;

      data_find.push({
        id,
        name,
        price,
        hasRecharge,
        fullRate,
        distance: park.distance,
        position: [data.lat, data.lon],
      });
    });

    const bestLots = findBestParkingLot(data_find, {
      needsRecharging: needRecharge,
      weights: weight,
    });
    setData(bestLots);
  }, [neonData, parkData, needRecharge, tdxData, weight, setData]);

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

  const icon = (FREEQUANTITY: number, TOTALQUANTITY: number): any | null => {
    if (TOTALQUANTITY === 0) return greyDot;
    const ratio = FREEQUANTITY / TOTALQUANTITY;
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

  return (
    <>
      {neonData?.data.map((park: NeonParkData, index: number) => {
        const lot = parkData?.ParkingAvailabilities.find(
          (p: ParkingAvailability) => p.CarParkID === park.name
        );
        const FREEQUANTITY = lot?.AvailableSpaces ?? 0;
        const TOTALQUANTITY = lot?.TotalSpaces ?? 0;
        const pData = tdxData?.find((p: ParkingLotData) => p.id === park.name);

        if (!pData) return null;

        const status_color = color(
          TOTALQUANTITY > 0 ? FREEQUANTITY / TOTALQUANTITY : 0
        );

        return (
          <Marker
            key={index}
            position={[pData.lat, pData.lon]}
            //@ts-ignore
            icon={icon(FREEQUANTITY, TOTALQUANTITY)}
          >
            <Popup
              //@ts-ignore
              autoPan={false}
            >
              <div>
                <h2 className="text-2xl font-bold">
                  {pData.name}
                  {pData.recharge && "⚡"}
                </h2>
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
