import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMetroData } from '@/hooks/useMetroData';
import { UserLocationMarker } from './UserLocationMarker';
import { MetroStationMarker } from './MetroStationMarker';
import { MetroLines } from './MetroLines';
import { SearchBar } from './SearchBar';
import { NearestStationCard } from './NearestStationCard';
import { StationBottomSheet } from './StationBottomSheet';
import type { MetroStation, NearestStation, UserLocation } from '@/types/metro';

function MapController({ center }: { center: UserLocation }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], 14, { animate: true });
  }, [map, center.lat, center.lng]);

  return null;
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

  // Calculate nearest station when location changes
  useEffect(() => {
    const activeLocation = searchLocation || userLocation;
    if (activeLocation) {
      const nearest = findNearestStation(activeLocation);
      setNearestStation(nearest);
    }
  }, [searchLocation, userLocation, findNearestStation]);

  const handleSearchSelect = (location: UserLocation) => {
    setSearchLocation(location);
  };

  const handleStationClick = (station: MetroStation) => {
    setSelectedStation(station);
  };

  const activeLocation = searchLocation || userLocation;
  const defaultCenter: [number, number] = [23.0225, 72.5714]; // Ahmedabad center

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

        {/* Metro lines */}
        <MetroLines
          eastWestStations={eastWestStations}
          northSouthStations={northSouthStations}
          eastWestColor={eastWestColor}
          northSouthColor={northSouthColor}
        />

        {/* Station markers */}
        {allStations.map((station) => (
          <MetroStationMarker
            key={station.id}
            station={station}
            isNearest={nearestStation?.id === station.id}
            onClick={handleStationClick}
          />
        ))}

        {/* User location */}
        {userLocation && !searchLocation && (
          <UserLocationMarker location={userLocation} />
        )}

        {/* Search location marker */}
        {searchLocation && (
          <UserLocationMarker location={searchLocation} />
        )}

        {/* Map controller for smooth panning */}
        {activeLocation && <MapController center={activeLocation} />}
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
