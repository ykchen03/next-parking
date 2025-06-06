"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMapEvent } from "react-leaflet";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Fab,
  Slider,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import MapIcon from "@mui/icons-material/Map";
import ClearIcon from "@mui/icons-material/Clear";
import PowerIcon from "@mui/icons-material/Power";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import AssistantIcon from "@mui/icons-material/Assistant";
import ScaleIcon from "@mui/icons-material/Scale";
import CloseIcon from "@mui/icons-material/Close";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ParkingLot from "../components/parking_tdx";
import ParkingDataGrid from "../components/parking_DataGrid";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import WheaterCard from "../components/WheaterCard";

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

type Position = [number, number];

type Weight = {
  fullRate: number;
  price: number;
  distance: number;
};

type LayerType = "osm" | "satellite";

const Init_Position: Record<CityName, Position> = {
  keelung: [25.13199763262815, 121.74444747496243],
  taipei: [25.037290698515058, 121.56442184344988],
  taoyuan: [24.993628, 121.300979],
  taichung: [24.147736, 120.673648],
  changhua: [24.071658, 120.542],
  yunlin: [23.709203, 120.431],
  tainan: [22.999728, 120.227028],
  kaohsiung: [22.627278, 120.301435],
  pingtung: [22.669, 120.492],
  yilan: [24.757, 121.753],
  hualien: [23.991, 121.611],
  taitung: [22.755, 121.14],
  kinmen: [24.432, 118.319],
};

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const LayersControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl),
  { ssr: false }
);
const LOverlay = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl.Overlay),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const LayerGroup = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayerGroup),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

export default function Home() {
  const { city } = useParams() as { city: CityName };
  const mapRef = useRef<any | null>(null);
  const [Target_find, setTarget_find] = useState<Position>(Init_Position[city]);
  const [Target_render, setTarget_render] = useState<Position>(
    Init_Position[city]
  );
  const [Gps, setGps] = useState<Position | null>(null);
  const [GpsIcon, setGpsIcon] = useState<any | null>(null);
  const [TargetIcon, setTargetIcon] = useState<any | null>(null);
  const [layer, setLayer] = useState<LayerType>("osm");
  const [dis_render, setDis_render] = useState<number>(500);
  const [dis_find, setDis_find] = useState<number>(500);
  const [showPark, setShowPark] = useState<boolean>(false);
  const [openSlider, setOpenSlider] = useState<boolean>(false);
  const [openDataGrid, setOpenDataGrid] = useState<boolean>(false);
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [openWheater, setOpenWheater] = useState<boolean>(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [needRecharge, setNeedRecharge] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [weight, setWeight] = useState<Weight>({
    fullRate: 0.3,
    price: 0.1,
    distance: 0.6,
  });
  const [weightTmp, setWeightTmp] = useState<Weight>({
    fullRate: 0.3,
    price: 0.1,
    distance: 0.6,
  });
  const [bestData, setBestData] = useState<any | null>(null);
  const [highlight, setHighlight] = useState<any | null>(null);

  useEffect(() => {
    const L = require("leaflet");
    setTargetIcon(
      L.icon({
        iconUrl: "icon/target.svg",
        iconSize: [25, 25],
        iconAnchor: [12, 12],
      })
    );
    setGpsIcon(
      L.icon({
        iconUrl: "icon/flag.svg",
        iconSize: [50, 50],
        iconAnchor: [24, 24],
      })
    );
    fetch(`boundary/${city}.geojson`)
      .then((res: Response) => res.json())
      .then((data: any) => {
        setGeoJsonData(data);
      });
  }, [city]);

  const TargetMarker = (): React.JSX.Element => {
    useMapEvent("click", (e: any) => {
      setTarget_render([e.latlng.lat, e.latlng.lng]);
    });
    const markerRef = useRef<any>(null);
    const eventHandlers = useMemo(
      () => ({
        dragend(): void {
          const marker = markerRef.current;
          if (marker) {
            const latLng = marker.getLatLng();
            setTarget_render([latLng.lat, latLng.lng]);
          }
        },
      }),
      []
    );
    return (
      <>
        <Marker
          // @ts-ignore
          icon={TargetIcon}
          position={Target_render}
          eventHandlers={eventHandlers}
          ref={markerRef}
          draggable={true}
        >
          <Circle
            center={Target_render}
            // @ts-ignore
            radius={dis_render}
            pathOptions={{ fillColor: "blue" }}
            fill={false}
          />
        </Marker>
      </>
    );
  };

  const handleDistanceChange = (
    event: Event,
    value: number | number[]
  ): void => {
    setDis_render((value as number) * 10);
  };

  const handleFlyToLocation = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.flyTo([latitude, longitude], 15, {
            duration: 2,
          });
          setGps([latitude, longitude]);
        },
        (error: GeolocationPositionError) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleFindPark = (): void => {
    setShowPark(true);
    setRefresh((prev) => !prev);
    setDis_find(dis_render);
    setTarget_find(Target_render);
  };

  return (
    <div>
      <main>
        <Header
          title={city.charAt(0).toUpperCase() + city.slice(1) + " Parking lot"}
        />
        <Box className="relative">
          <MapContainer
            // @ts-ignore
            center={Init_Position[city]}
            zoom={15}
            style={{ height: "calc(100vh - 64px)", width: "100%" }}
            ref={mapRef}
          >
            {layer === "osm" ? (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                // @ts-ignore
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            ) : (
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
                // @ts-ignore
                attribution='&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            )}
            <LayersControl
              // @ts-ignore
              position="topright"
            >
              <LOverlay checked name="Parking Lots">
                <LayerGroup>
                  {showPark && (
                    <>
                      <ParkingLot
                        city={city}
                        target={Target_find}
                        m_dis={dis_find}
                        needRecharge={needRecharge}
                        refresh={refresh}
                        /*findBest={findBest}*/
                        setData={setBestData}
                        weight={weight}
                      />
                      <Circle
                        center={Target_find}
                        // @ts-ignore
                        radius={dis_find}
                        pathOptions={{ fillColor: "yellow" }}
                        stroke={false}
                      />
                      {highlight && (
                        <Circle
                          center={highlight.position}
                          // @ts-ignore
                          radius={50}
                          pathOptions={{ fillColor: "red", color: "red" }}
                        />
                      )}
                    </>
                  )}
                </LayerGroup>
              </LOverlay>
              <LOverlay checked name="Target">
                <LayerGroup>
                  <TargetMarker />
                </LayerGroup>
              </LOverlay>
              <LOverlay checked name="GPS">
                <LayerGroup>
                  {Gps && (
                    <Marker
                      position={Gps}
                      // @ts-ignore
                      icon={GpsIcon}
                    >
                      <Popup
                        // @ts-ignore
                        autoPan={false}
                      >
                        <div>
                          <h2>Your Location</h2>
                          <p>Latitude: {Gps[0]}</p>
                          <p>Longitude: {Gps[1]}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </LayerGroup>
              </LOverlay>
              <LOverlay checked name="Boundary">
                <LayerGroup>
                  {geoJsonData && (
                    <GeoJSON
                      data={geoJsonData}
                      //@ts-ignore
                      style={{ fill: false, dashArray: [4] }}
                    />
                  )}
                </LayerGroup>
              </LOverlay>
            </LayersControl>
          </MapContainer>
          <Box
            className="absolute bottom-0 right-0 m-2 p-1 z-400 rounded-md"
            sx={{
              "& > :not(style)": { m: 1 },
            }}
          >
            <Fab
              color="warning"
              aria-label="weather"
              onClick={() => setOpenWheater(true)}
            >
              <ThermostatIcon />
            </Fab>
            <Fab
              aria-label="dialog"
              color="info"
              onClick={() => setOpenEditor(true)}
            >
              <ScaleIcon />
            </Fab>
            <Fab
              color="secondary"
              aria-label="range"
              onClick={() => setOpenSlider(true)}
            >
              <TrackChangesIcon />
            </Fab>
            <Fab aria-label="fly" color="success" onClick={handleFlyToLocation}>
              <GpsFixedIcon />
            </Fab>
            <Fab aria-label="find" color="primary" onClick={handleFindPark}>
              <LocalParkingIcon />
            </Fab>
          </Box>
          <Drawer
            open={openSlider}
            onClose={() => setOpenSlider(false)}
            anchor="right"
            slotProps={{
              paper: {
                sx: { backdropFilter: "blur(10px)", backgroundColor: "unset" },
              },
              backdrop: { sx: { backgroundColor: "unset" } },
            }}
          >
            <IconButton
              color="error"
              aria-label="back"
              size="large"
              onClick={() => setOpenSlider(false)}
            >
              <ClearIcon />
            </IconButton>
            <Box className="m-2 text-center w-3xs" minHeight="50%">
              <Slider
                aria-label="distance"
                orientation="vertical"
                value={dis_render / 10}
                step={5}
                valueLabelFormat={(x) => `${x * 10}m`}
                valueLabelDisplay="auto"
                onChange={handleDistanceChange}
                marks={[
                  { value: 0, label: "0m" },
                  { value: 25, label: "250m" },
                  { value: 50, label: "500m" },
                  { value: 75, label: "750m" },
                  { value: 100, label: "1km" },
                ]}
                sx={{
                  "& .MuiSlider-markLabel": {
                    color: layer === "osm" ? "black" : "white",
                  },
                }}
              />
            </Box>
          </Drawer>
          <Dialog
            onClose={() => {
              setOpenEditor(false);
              setWeightTmp(weight);
            }}
            open={openEditor}
          >
            <DialogTitle>Weight</DialogTitle>
            <DialogContent>
              <DialogContentText>
                The sum of weights should be 1.
              </DialogContentText>
              <List>
                <ListItem>
                  <TextField
                    label="Full Rate"
                    type="number"
                    value={weightTmp.fullRate}
                    onChange={(e) =>
                      setWeightTmp({
                        ...weightTmp,
                        fullRate: Number(e.target.value),
                      })
                    }
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="Price"
                    type="number"
                    value={weightTmp.price}
                    onChange={(e) =>
                      setWeightTmp({
                        ...weightTmp,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="Distance"
                    type="number"
                    value={weightTmp.distance}
                    onChange={(e) =>
                      setWeightTmp({
                        ...weightTmp,
                        distance: Number(e.target.value),
                      })
                    }
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenEditor(false);
                  setWeightTmp({ ...weight });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (
                    weightTmp.fullRate +
                      weightTmp.price +
                      weightTmp.distance ===
                    1
                  ) {
                    setOpenEditor(false);
                    setWeight({ ...weightTmp });
                  } else {
                    alert("The sum of weights should be 1.");
                  }
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog onClose={() => setOpenWheater(false)} open={openWheater}>
            <IconButton
              aria-label="close"
              onClick={() => setOpenWheater(false)}
              sx={(theme) => ({
                position: "absolute",
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>
              <WheaterCard city={city} />
            </DialogContent>
          </Dialog>
          <Box className="absolute top-0 left-1/2 transform-gpu -translate-x-1/2 z-400 m-2">
            <BottomNavigation
              className="backdrop-filter backdrop-blur rounded-sm"
              showLabels
              value={layer}
              onChange={(event, newValue) => {
                setLayer(newValue);
              }}
              sx={{
                backgroundColor: "unset",
                "& .MuiBottomNavigationAction-root:not(.Mui-selected)": {
                  color: layer === "osm" ? "black" : "white",
                },
              }}
            >
              <BottomNavigationAction
                value="osm"
                icon={<MapIcon />}
                label="OSM"
              />
              <BottomNavigationAction
                value="satellite"
                icon={<SatelliteAltIcon />}
                label="Satellite"
              />
            </BottomNavigation>
          </Box>
          <Box
            className="absolute bottom-0 left-0 m-2 p-1 z-400"
            sx={{
              "& > :not(style)": { m: 1 },
            }}
          >
            <Fab
              color="error"
              aria-label="find"
              onClick={() => setOpenDataGrid(true)}
            >
              <AssistantIcon />
            </Fab>
            <ToggleButton
              className="backdrop-filter backdrop-blur"
              color="warning"
              aria-label="recharge"
              value="check"
              selected={needRecharge}
              onClick={() => setNeedRecharge((prev) => !prev)}
            >
              {needRecharge ? <PowerIcon /> : <PowerOffIcon />}
            </ToggleButton>
          </Box>
          <Drawer
            open={openDataGrid}
            onClose={() => setOpenDataGrid(false)}
            anchor="left"
            slotProps={{
              paper: {
                sx: { backdropFilter: "blur(10px)", backgroundColor: "unset" },
              },
              backdrop: { sx: { backgroundColor: "unset" } },
            }}
          >
            <IconButton
              color="error"
              aria-label="back"
              size="large"
              onClick={() => setOpenDataGrid(false)}
            >
              <ClearIcon />
            </IconButton>
            <Box className=/*"absolute max-h-400 bottom-0 left-0 z-400*/ "m-2 backdrop-filter backdrop-blur">
              <ParkingDataGrid data={bestData} setHighlight={setHighlight} />
            </Box>
          </Drawer>
        </Box>
      </main>
    </div>
  );
}
