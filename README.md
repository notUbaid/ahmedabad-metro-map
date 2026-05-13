# Ahmedabad Metro Map

An immersive, interactive Ahmedabad metro explorer built with React, Vite, Tailwind CSS, and Leaflet.

This app transforms raw metro line data into a beautifully layered transit experience with live location awareness, Ahmedabad place search, nearest-station discovery, and station detail cards.

---

## 🚇 What problem this solves

Ahmedabad commuters and visitors need a fast, visually clean way to understand the metro network and locate the nearest station without digging through schedules or static diagrams.

This app solves that by:

- showing the Ahmedabad metro network on a full-screen interactive map
- highlighting East–West and North–South metro lines with crisp line colors
- surfacing the nearest station to the user automatically
- allowing address search via OpenStreetMap/Nominatim
- displaying station details and interchange status in a mobile-ready bottom sheet

---

## ✨ Core experience

When the app loads, it renders a full-screen Leaflet map centered on Ahmedabad/Gandhinagar.

Key UX flows:

- **Automatic geolocation**: detects the user and centers the map on the current location
- **Metro line overlays**: draws East–West and North–South lines plus the GNLU → PDEU → Gift City branch
- **Station markers**: colored markers distinguish each line and highlight interchange stations
- **Nearest station card**: shows the closest station, walking distance, and estimated walk time
- **Place search**: type any Ahmedabad location and jump directly to it using Nominatim search results
- **Station details sheet**: tap a marker to view station name, served line(s), interchange badge, and train status placeholder

---

## 🧠 How it works

### Metro data
The network is defined in `src/data/metroStations.json` with:

- station IDs
- station names
- latitude / longitude coordinates
- interchange flags
- line assignments

The lines are:

- `East-West Line` (blue)
- `North-South Line` (red)
- `North-South Branch Line` (extension through Gift City)

### Business logic
The main data flow is:

- `src/hooks/useMetroData.ts` reads JSON, merges shared stations, and computes the nearest station
- `src/hooks/useGeolocation.ts` requests browser location and falls back to central Ahmedabad when denied
- `src/hooks/useNominatimSearch.ts` queries OpenStreetMap for local Ahmedabad addresses
- `src/components/MetroMap.tsx` draws the map, lines, markers, and UI overlays

### UI components

- `SearchBar` — search Ahmedabad places and pan the map to selected results
- `NearestStationCard` — surface real-time nearest station and walking estimate
- `StationBottomSheet` — show station details, served lines, and interchange status

---

## 🚀 Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

### Recommended workflow

1. allow location access when prompted
2. search for a place in Ahmedabad if you want to explore a specific area
3. click any station marker to open the station details sheet
4. inspect the nearest station prompt at the bottom of the screen

---

## 🧩 Project structure

- `src/components/MetroMap.tsx` — map visualization and station interactions
- `src/components/SearchBar.tsx` — Ahmedabad search UI powered by Nominatim
- `src/components/NearestStationCard.tsx` — nearest station summary UI
- `src/components/StationBottomSheet.tsx` — station detail sheet UI
- `src/hooks/useMetroData.ts` — metro network logic and nearest station calculation
- `src/hooks/useGeolocation.ts` — browser geolocation fallback logic
- `src/data/metroStations.json` — Ahmedabad metro station model
- `src/types/metro.ts` — TypeScript models for stations, lines, and search results

---

## 💎 Why this app is special

- Designed as a modern transit companion rather than a static map
- Uses live browser location to make the map feel personal and actionable
- Provides a clean Ahmedabad-focused search experience
- Built with polished UI primitives and a minimalist full-screen map layout

---

## 🔧 Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Leaflet
- OpenStreetMap / Nominatim
- shadcn/ui-style components

---

## 📈 Next-level upgrade ideas

- add real-time train schedules
- route planning between stations
- native mobile-friendly gestures and offline caching
- dark mode / theme toggle
- station filter by line or interchange

---

## 📌 Notes

This repo currently focuses on Ahmedabad metro mapping, nearest station discovery, and search-driven exploration. It is ideal for building a commuter-friendly transit utility or a city mobility proof-of-concept.
