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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  AppBar,
  Toolbar,
  Typography,
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
import HomeIcon from "@mui/icons-material/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParkingLot from "../components/parking_hc";
import ParkingDataGrid from "../components/parking_DataGrid";
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
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);
const queryClient = new QueryClient();

export default function Home() {
  const mapRef = useRef(null);
  const [Target_find, setTarget_find] = useState([
    24.806805602144337, 120.9690507271121,
  ]);
  const [Target_render, setTarget_render] = useState([
    24.806805602144337, 120.9690507271121,
  ]);
  const [Gps, setGps] = useState(null);
  const [GpsIcon, setGpsIcon] = useState(null);
  const [TargetIcon, setTargetIcon] = useState(null);
  const [layer, setLayer] = useState("osm");
  const [dis_render, setDis_render] = useState(500);
  const [dis_find, setDis_find] = useState(500);
  const [showPark, setShowPark] = useState(false);
  const [openSlider, setOpenSlider] = useState(false);
  const [openDataGrid, setOpenDataGrid] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [needRecharge, setNeedRecharge] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [findBest, setFindBest] = useState(false);
  const [weight, setWeight] = useState({
    fullRate: 0.3,
    price: 0.1,
    distance: 0.6,
  });
  const [weightTmp, setWeightTmp] = useState({
    fullRate: 0.3,
    price: 0.1,
    distance: 0.6,
  });
  const [bestData, setBestData] = useState(null);
  const [highlight, setHighlight] = useState(null);

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
    fetch("boundary/hsinchu.geojson")
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
          const marker = markerRef.current;
          if (marker) {
            setTarget_render(marker.getLatLng());
          }
        },
      }),
      []
    );
    return (
      <>
        <Marker
          icon={TargetIcon}
          position={Target_render}
          eventHandlers={eventHandlers}
          ref={markerRef}
          draggable={true}
        >
          <Circle
            center={Target_render}
            radius={dis_render}
            pathOptions={{ fillColor: "blue" }}
            fill={false}
          />
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
        <Box className="flex">
          <AppBar position="static" color="inherit">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="home" href="/">
                <HomeIcon />
              </IconButton>
              <Typography
                className="text-center grow"
                variant="h6"
                component="div"
              >
                Hsinchu Parking Lot Finder
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Box className="relative">
          <MapContainer
            center={[24.806805602144337, 120.9690507271121]}
            zoom={15}
            style={{ height: "calc(100vh - 64px)", width: "100%" }}
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
                          setData={setBestData}
                          weight={weight}
                        />
                      </QueryClientProvider>
                      <Circle
                        center={Target_find}
                        radius={dis_find}
                        pathOptions={{ fillColor: "yellow" }}
                        stroke={false}
                      />
                      {highlight && (
                        <Circle
                          center={highlight.position}
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
                    <Marker position={Gps} icon={GpsIcon}>
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
                  {geoJsonData && (
                    <GeoJSON
                      data={geoJsonData}
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
              aria-label="dialog"
              color="info"
              onClick={() => setOpenDialog(true)}
            >
              <ScaleIcon />
            </Fab>
            <Fab
              color="secondary"
              aria-label="range"
              onClick={() => setOpenDrawer(true)}
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
          <Dialog
            onClose={() => {
              setOpenDialog(false);
              setWeightTmp(weight);
            }}
            open={openDialog}
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
                  setOpenDialog(false);
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
                    setOpenDialog(false);
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
          {/*<Box
            className="absolute bottom-0 left-1/2 transform-gpu -translate-x-1/2 m-2 p-1 z-400"
            sx={{
              "& > :not(style)": { m: 1 },
            }}
          >
          </Box>*/}
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
            <Box className=/*"absolute max-h-400 bottom-0 left-0 z-400*/"m-2 backdrop-filter backdrop-blur">
              <ParkingDataGrid data={bestData} setHighlight={setHighlight} />
            </Box>
          </Drawer>
        </Box>
      </main>
    </div>
  );
}
