import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Circle, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMetroData } from '@/hooks/useMetroData';
import { SearchBar } from './SearchBar';
import { NearestStationCard } from './NearestStationCard';
import { StationBottomSheet } from './StationBottomSheet';
import type { MetroStation, NearestStation, UserLocation } from '@/types/metro';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createMarkerIcon(station: MetroStation & { lines?: ('east-west' | 'north-south')[] }, isNearest: boolean) {
  const size = isNearest ? 28 : 20;
  const isInterchange = station.interchange;
  
  let bgColor: string;
  if (isInterchange) {
    bgColor = 'linear-gradient(135deg, #3B82F6 50%, #EF4444 50%)';
  } else if (station.line === 'east-west' || station.lines?.includes('east-west')) {
    bgColor = '#3B82F6';
  } else {
    bgColor = '#EF4444';
  }

  const nearestShadow = isNearest 
    ? 'box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4);' 
    : 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border-radius: 50%;
        border: 3px solid white;
        ${nearestShadow}
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${isInterchange ? `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface MapContentProps {
  userLocation: UserLocation | null;
  searchLocation: UserLocation | null;
  allStations: (MetroStation & { lines?: ('east-west' | 'north-south')[] })[];
  eastWestStations: MetroStation[];
  northSouthStations: MetroStation[];
  eastWestColor: string;
  northSouthColor: string;
  nearestStation: NearestStation | null;
  onStationClick: (station: MetroStation) => void;
}

function MapContent({
  userLocation,
  searchLocation,
  allStations,
  eastWestStations,
  northSouthStations,
  eastWestColor,
  northSouthColor,
  nearestStation,
  onStationClick,
}: MapContentProps) {
  const map = useMap();
  const activeLocation = searchLocation || userLocation;

  useEffect(() => {
    if (activeLocation) {
      map.setView([activeLocation.lat, activeLocation.lng], 14, { animate: true });
    }
  }, [map, activeLocation]);

  const eastWestCoords = eastWestStations.map(s => [s.lat, s.lng] as [number, number]);
  const northSouthCoords = northSouthStations.map(s => [s.lat, s.lng] as [number, number]);

  return (
    <>
      {/* Metro lines */}
      <Polyline
        positions={eastWestCoords}
        pathOptions={{
          color: eastWestColor,
          weight: 4,
          opacity: 0.8,
        }}
      />
      <Polyline
        positions={northSouthCoords}
        pathOptions={{
          color: northSouthColor,
          weight: 4,
          opacity: 0.8,
        }}
      />

      {/* Station markers */}
      {allStations.map((station) => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={createMarkerIcon(station, nearestStation?.id === station.id)}
          eventHandlers={{
            click: () => onStationClick(station),
          }}
        />
      ))}

      {/* User/Search location */}
      {activeLocation && (
        <>
          <Circle
            center={[activeLocation.lat, activeLocation.lng]}
            radius={100}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.15,
              weight: 0,
            }}
          />
          <CircleMarker
            center={[activeLocation.lat, activeLocation.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#3B82F6',
              fillOpacity: 1,
              weight: 3,
            }}
          />
        </>
      )}
    </>
  );
}

export function MetroMap() {
  const { location: userLocation, loading: locationLoading } = useGeolocation();
  const {
    allStations,
    eastWestStations,
    northSouthStations,
    eastWestColor,
    northSouthColor,
    findNearestStation,
  } = useMetroData();

  const [searchLocation, setSearchLocation] = useState<UserLocation | null>(null);
  const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
  const [nearestStation, setNearestStation] = useState<NearestStation | null>(null);

  useEffect(() => {
    const activeLocation = searchLocation || userLocation;
    if (activeLocation) {
      const nearest = findNearestStation(activeLocation);
      setNearestStation(nearest);
    }
  }, [searchLocation, userLocation, findNearestStation]);

  const handleSearchSelect = useCallback((location: UserLocation) => {
    setSearchLocation(location);
  }, []);

  const handleStationClick = useCallback((station: MetroStation) => {
    setSelectedStation(station);
  }, []);

  const activeLocation = searchLocation || userLocation;
  const defaultCenter: [number, number] = [23.0225, 72.5714];

  if (locationLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={activeLocation ? [activeLocation.lat, activeLocation.lng] : defaultCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapContent
          userLocation={userLocation}
          searchLocation={searchLocation}
          allStations={allStations}
          eastWestStations={eastWestStations}
          northSouthStations={northSouthStations}
          eastWestColor={eastWestColor}
          northSouthColor={northSouthColor}
          nearestStation={nearestStation}
          onStationClick={handleStationClick}
        />
      </MapContainer>

      {/* Search bar */}
      <SearchBar onLocationSelect={handleSearchSelect} />

      {/* Nearest station card */}
      {nearestStation && (
        <NearestStationCard
          station={nearestStation}
          onClick={() => setSelectedStation(nearestStation)}
        />
      )}

      {/* Station bottom sheet */}
      {selectedStation && (
        <StationBottomSheet
          station={selectedStation as MetroStation & { lines?: ('east-west' | 'north-south')[] }}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
}
