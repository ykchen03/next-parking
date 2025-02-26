'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from "react";
import { Box,IconButton } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import CachedIcon from '@mui/icons-material/Cached';
import ParkingLot from './parking-lot';
import "leaflet/dist/leaflet.css";

// Dynamically import MapContainer and other components from react-leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const LayersControl = dynamic(() => import("react-leaflet").then(mod => mod.LayersControl), { ssr: false });
const LOverlay = dynamic(() => import("react-leaflet").then(mod => mod.LayersControl.Overlay), { ssr: false });
//const Circle = dynamic(() => import("react-leaflet").then(mod => mod.Circle), { ssr: false });
const LayerGroup = dynamic(() => import("react-leaflet").then(mod => mod.LayerGroup), { ssr: false });

export default function Home() {
  const mapRef = useRef(null);
  const [curLoc, setCurLoc] = useState([24.801781, 120.972553]);

  useEffect(() => {
    // Dynamically import leaflet and fix the default icon issue
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const handleFlyToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current.flyTo([latitude, longitude], 15, {
            duration: 2
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleRefreshLocation = () => {
    if(mapRef.current){
      const center = mapRef.current.getCenter();
      setCurLoc([center.lat, center.lng]);
    }
  }

  return (
    <div>
      <main>
        <MapContainer center={[24.801781, 120.972553]} zoom={13} style={{ height: "100vh", width: "100%" }} ref={mapRef}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LayersControl position="topright">
            <LOverlay checked name="Parking Lots">
              <LayerGroup>
                <ParkingLot lat={curLoc[0]} lon={curLoc[1]} dis={500} />
              </LayerGroup>
            </LOverlay>
          </LayersControl>
        </MapContainer>
        <Box sx={{ position: 'absolute', bottom: 0, right: 0, m: 2, zIndex: 1000 }}>
          <IconButton aria-label="fly" color="primary" size="large" onClick={handleFlyToLocation}>
            <NavigationIcon fontSize='inherit'/>
          </IconButton>
          <IconButton aria-label="refresh" color="primary" size="large" onClick={handleRefreshLocation}>
            <CachedIcon fontSize='inherit'/>
          </IconButton>
        </Box>
      </main>
    </div>
  );
}