# Next-Parking

A smart parking lot finder application built with Next.js that helps users find the optimal parking spot based on various criteria like price, availability, and EV charging capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🚗 Features

- **Smart Parking Algorithm**: Finds the best parking lot based on customizable preferences
- **Real-time Data**: Connects to live parking availability data
- **EV Charging Support**: Filter for parking lots with electric vehicle charging stations
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Interactive UI**: User-friendly interface for setting preferences and viewing results

## 🚀 Demo

Visit [https://next-parking.vercel.app](https://next-parking.vercel.app) to see the application in action.

## 🧠 How the Algorithm Works

The parking lot finder uses a weighted scoring system that considers:

1. **Price**: Lower prices receive higher scores
2. **Fullness Rate**: Less occupied parking lots score higher
3. **EV Charging**: Availability of charging stations (when needed)

Users can customize:
- Maximum price they're willing to pay
- Maximum acceptable occupancy percentage
- Need for EV charging
- Importance weights for each factor

## 🧩 Project Structure

```
📦 next-parking/
├── app/                         # Main application directory (Next.js 15 App Router)
│   ├── api/                     # Route handlers for APIs (e.g., auth, data fetching)
│   ├── lib/                     # Custom libraries, utilities, and helpers
│   ├── components/              # Shared, reusable UI components
│   ├── hsinchu/                 # Static route for Hsinchu City's parking data
│   ├── [city]/                  # Dynamic route for other cities (e.g., /taipei, /tainan)
│   └── page.js                  # Root index page (homepage)
├── public/                      # Publicly accessible static assets (e.g., icons, images, GeoJSON)
├── .env.local                   # Environment variables (kept local, excluded from Git)
├── package.json                 # Project manifest (scripts, dependencies, metadata)
├── vercel.json                 # Vercel deployment configuration (rewrites, routes, etc.)
└── next.config.js               # Custom configuration for Next.js
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

YK Chen - [@ykchen03](https://github.com/ykchen03)

Project Link: [https://github.com/ykchen03/next-parking](https://github.com/ykchen03/next-parking)

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/)
- [Neon Serverless Postgres](https://neon.tech/)
- [Transport Data Exchange](https://tdx.transportdata.tw/)
- [Goverment OpenData Platform](https://data.gov.tw/)
