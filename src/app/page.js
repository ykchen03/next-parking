"use client";
import dynamic from "next/dynamic";
import { useMapEvent } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Fab,
  Slider,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import NavigationIcon from "@mui/icons-material/Navigation";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import MapIcon from "@mui/icons-material/Map";
import ParkingLot from "./parking-lot";
import ClearIcon from "@mui/icons-material/Clear";
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

export default function Home() {
  const mapRef = useRef(null);
  const [curLoc, setCurLoc] = useState([24.806805602144337, 120.9690507271121]);
  const [mapCenter, setMapCenter] = useState([
    24.806805602144337, 120.9690507271121,
  ]);
  const [layer, setLayer] = useState("osm");
  const [dis, setDis] = useState(500);
  const [showPark, setShowPark] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const GetCenter = () => {
    const map = useMapEvent("moveend", () => {
      const newCenter = map.getCenter();
      if (newCenter.lat !== mapCenter.lat || newCenter.lng !== mapCenter.lng) {
        setMapCenter([newCenter.lat, newCenter.lng]);
      }
    });
    return null;
  };

  const handleFlyToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current.flyTo([latitude, longitude], 15, {
            duration: 2,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleFindPark = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      setCurLoc([center.lat, center.lng]);
      setShowPark(true);
    }
  };

  const handleDistanceChange = (event, value) => {
    setDis(value * 10);
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
          <GetCenter />
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
                    <ParkingLot
                      u_lat={curLoc[0]}
                      u_lon={curLoc[1]}
                      m_dis={dis}
                    />
                    <Circle
                      center={curLoc}
                      radius={dis}
                      pathOptions={{ fillColor: "yellow" }}
                      stroke={false}
                    />
                  </>
                )}
              </LayerGroup>
            </LOverlay>
            <LOverlay checked name="Circle">
              <LayerGroup>
                <Circle center={mapCenter} radius={dis} fill={false} />
              </LayerGroup>
            </LOverlay>
            <LOverlay checked name="Center">
              <LayerGroup>
                <Marker position={mapCenter} />
              </LayerGroup>
            </LOverlay>
          </LayersControl>
        </MapContainer>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            m: 2,
            padding: 1,
            "& > :not(style)": { m: 1 },
            zIndex: 1000,
            borderRadius: 5,
          }}
        >
          <Fab aria-label="fly" color="success" onClick={handleFlyToLocation}>
            <NavigationIcon />
          </Fab>
          <Fab aria-label="find" color="primary" onClick={handleFindPark}>
            <LocalParkingIcon />
          </Fab>
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            m: 2,
            padding: 1,
            zIndex: 1000,
            //backdropFilter: "blur(10px)",
            //borderRadius: 5,
          }}
        >
          <Fab
            color="secondary"
            aria-label="range"
            onClick={() => setOpenDrawer(true)}
          >
            <PanoramaFishEyeIcon />
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
            color="error"
            aria-label="back"
            size="large"
            sx={{ alignSelf: "flex-end" }}
            onClick={() => setOpenDrawer(false)}
          >
            <ClearIcon />
          </IconButton>
          <Box
            width="25%"
            sx={{
              m: 2,
              alignSelf: "center",
            }}
          >
            <Slider
              aria-label="distance"
              value={dis / 10}
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
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            m: 2,
            zIndex: 1000,
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
