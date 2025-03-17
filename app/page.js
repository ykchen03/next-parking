"use client";
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
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import MapIcon from "@mui/icons-material/Map";
import ClearIcon from "@mui/icons-material/Clear";
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import AssistantIcon from '@mui/icons-material/Assistant';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParkingLot from "./parking_hc";
import "leaflet/dist/leaflet.css";

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
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);
const queryClient = new QueryClient();

export default function Home() {
  const mapRef = useRef(null);
  const [Target_find, setTarget_find] = useState([24.806805602144337, 120.9690507271121]);
  const [Target_render, setTarget_render] = useState([
    24.806805602144337, 120.9690507271121,
  ]);
  const [Gps, setGps] = useState(null);
  const [GpsIcon, setGpsIcon] = useState(null);
  const [layer, setLayer] = useState("osm");
  const [dis_render, setDis_render] = useState(500);
  const [dis_find, setDis_find] = useState(500);
  const [showPark, setShowPark] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [needRecharge, setNeedRecharge] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [findBest, setFindBest] = useState(false);

  useEffect(() => {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "target.svg",//"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconSize: [25, 25],
      iconAnchor: [12, 12],
      shadowUrl: "",
    });
    setGpsIcon(
      L.icon({
        iconUrl: "flag.svg",
        iconSize: [50, 50],
        iconAnchor: [24, 24],
      })
    );
    fetch("hc_geo.json")
    .then((res) => res.json())
    .then((data) => {
      setGeoJsonData(data);
    });
  }, []);

  const TargetMarker = () => {
    useMapEvent("click", (e) => {
      setTarget_render([e.latlng.lat, e.latlng.lng]);
    });
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker) {
            setTarget_render(marker.getLatLng())
          }
        },
      }),
      [],
    );
    return (
      <>
      <Marker position={Target_render} eventHandlers={eventHandlers} ref={markerRef} draggable={true}>
        <Circle center={Target_render} radius={dis_render} pathOptions={{ fillColor: "blue" }} fill={false}/>
      </Marker>
      </>
    );
  };

  const handleDistanceChange = (event, value) => {
    setDis_render(value * 10);
  };

  const handleFlyToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current.flyTo([latitude, longitude], 15, {
            duration: 2,
          });
          setGps([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleFindPark = () => {
    setShowPark(true);
    setRefresh((prev) => !prev);
    setDis_find(dis_render);
    setTarget_find(Target_render);
  };

  return (
    <div>
      <main>
        <MapContainer
          center={[24.806805602144337, 120.9690507271121]}
          zoom={15}
          style={{ height: "100vh", width: "100%" }}
          ref={mapRef}
        >
          {layer === "osm" ? (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          ) : (
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
              attribution='&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          )}
          <LayersControl position="topright">
            <LOverlay checked name="Parking Lots">
              <LayerGroup>
                {showPark && (
                  <>
                    <QueryClientProvider client={queryClient}>
                      <ParkingLot
                        target={Target_find}
                        m_dis={dis_find}
                        needRecharge={needRecharge}
                        refresh={refresh}
                        findBest={findBest}
                      />
                    </QueryClientProvider>
                    <Circle
                      center={Target_find}
                      radius={dis_find}
                      pathOptions={{ fillColor: "yellow" }}
                      stroke={false}
                    />
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
                    icon={GpsIcon}
                  >
                    <Popup autoPan={false}>
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
                {geoJsonData && <GeoJSON data={geoJsonData} style={{fill: false, dashArray: [4]}}/>}
              </LayerGroup>
            </LOverlay>
          </LayersControl>
        </MapContainer>
        <Box className="absolute bottom-0 right-0 m-2 p-1 z-400"
          sx={{
            "& > :not(style)": { m: 1 },
          }}
        >
          <Fab
            color="secondary"
            aria-label="range"
            onClick={() => setOpenDrawer(true)}
          >
            <PanoramaFishEyeIcon />
          </Fab>
          <Fab aria-label="fly" color="success" onClick={handleFlyToLocation}>
            <GpsFixedIcon />
          </Fab>
          <Fab aria-label="find" color="primary" onClick={handleFindPark}>
            <LocalParkingIcon />
          </Fab>
        </Box>
        <Drawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          anchor="bottom"
          slotProps={{
            paper: {
              sx: { backdropFilter: "blur(10px)", backgroundColor: "unset" },
            },
            backdrop: { sx: { backgroundColor: "unset" } },
          }}
        >
          <IconButton
            className="self-end"
            color="error"
            aria-label="back"
            size="large"
            onClick={() => setOpenDrawer(false)}
          >
            <ClearIcon />
          </IconButton>
          <Box
            className="m-2 self-center"
            width="25%"
          >
            <Slider
              aria-label="distance"
              value={dis_render / 10}
              step={5}
              scale={(x) => `${x * 10}m`}
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
        <Box className="absolute bottom-0 m-2 p-1 z-400"
          sx={{
            left: "50%",
            transform: "translateX(-50%)",
            "& > :not(style)": { m: 1 },
          }}
        >
        <ToggleButton
          color="warning"
          aria-label="recharge"
          value="check"
          selected={needRecharge}
          onClick={() => setNeedRecharge((prev) => !prev)}
          sx={{ backdropFilter: "blur(10px)"}}
        >
          {needRecharge ? <PowerIcon /> : <PowerOffIcon />}
        </ToggleButton>
        <Fab
          color="error"
          aria-label="find"
          onClick={() => setFindBest((prev) => !prev)}
        >
          <AssistantIcon />
        </Fab>
        </Box>
        <Box className="absolute top-0 m-2 z-400"
          sx={{
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <BottomNavigation
            showLabels
            value={layer}
            onChange={(event, newValue) => {
              setLayer(newValue);
            }}
            sx={{
              borderRadius: 5,
              backgroundColor: "unset",
              backdropFilter: "blur(10px)",
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
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            zIndex: 1000,
            borderRadius: 5,
          }}
        >
          <BarChart
            xAxis={[
              {
                valueFormatter: (v, c) => {
                  return `${v}%`;
                },
                tickInterval: [0, 25, 50, 75, 100],
              },
            ]}
            yAxis={[{ scaleType: "band", data: ["額滿率"] }]}
            series={[
              { data: [25], stack: "a", color: "#2AAD27" },
              { data: [25], stack: "a", color: "#CAC428" },
              { data: [25], stack: "a", color: "#CB8427" },
              { data: [25], stack: "a", color: "#CB2B3E" },
            ]}
            width={500}
            height={120}
            layout="horizontal"
            sx={{
              "& .MuiChartsAxis-tickLabel": {
                fill: layer === "osm" ? "black" : "white",
              },
            }}
          />
        </Box>
      </main>
    </div>
  );
}
