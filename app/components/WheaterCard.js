"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";

// Replace with your OpenWeatherMap API key

export default function WheaterCard({ city = "Taipei" }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather?city=${city}`);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        setWeather(null);
      }
      setLoading(false);
    }
    fetchWeather();
  }, [city]);

  return (
    <Card sx={{ minWidth: 250, maxWidth: 350, m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {city} 天氣
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
            <CircularProgress />
          </Box>
        ) : weather ? (
          <Box display="flex" alignItems="center" gap={2}>
            {weather.weather && weather.weather[0] && (
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                width={60}
                height={60}
              />
            )}
            <Box>
              <Typography variant="h4">
                {Math.round(weather.main.temp)}°C
              </Typography>
              <Typography variant="body2">
                {weather.weather[0].description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                濕度: {weather.main.humidity}%　風速: {weather.wind.speed} m/s
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography color="error">無法取得天氣資料</Typography>
        )}
      </CardContent>
    </Card>
  );
}