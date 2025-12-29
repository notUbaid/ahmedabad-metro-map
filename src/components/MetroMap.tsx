import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMetroData } from '@/hooks/useMetroData';
import { SearchBar } from './SearchBar';
import { NearestStationCard } from './NearestStationCard';
import { StationBottomSheet } from './StationBottomSheet';
import type { MetroStation, NearestStation, UserLocation } from '@/types/metro';

export function MetroMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const { location: userLocation } = useGeolocation();
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

  const activeLocation = searchLocation || userLocation;

  // Calculate nearest station
  useEffect(() => {
    const loc = searchLocation || userLocation || { lat: 23.0225, lng: 72.5714 };
    const nearest = findNearestStation(loc);
    setNearestStation(nearest);
  }, [searchLocation, userLocation, findNearestStation]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [23.0225, 72.5714],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Add metro lines and stations
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Draw metro lines
    const ewCoords = eastWestStations.map(s => [s.lat, s.lng] as L.LatLngTuple);
    const nsCoords = northSouthStations.map(s => [s.lat, s.lng] as L.LatLngTuple);

    L.polyline(ewCoords, { color: eastWestColor, weight: 4 }).addTo(map);
    L.polyline(nsCoords, { color: northSouthColor, weight: 4 }).addTo(map);

    // Add station markers
    allStations.forEach(station => {
      const isEastWest = station.line === 'east-west' || station.lines?.includes('east-west');
      const isNearest = nearestStation?.id === station.id;
      const size = isNearest ? 14 : 10;
      const color = station.interchange ? '#8B5CF6' : (isEastWest ? '#3B82F6' : '#EF4444');

      const marker = L.circleMarker([station.lat, station.lng], {
        radius: size,
        fillColor: color,
        color: '#fff',
        weight: 3,
        fillOpacity: 1,
      }).addTo(map);

      marker.bindPopup(station.name);
      marker.on('click', () => setSelectedStation(station));
      markersRef.current.push(marker as any);
    });
  }, [allStations, eastWestStations, northSouthStations, eastWestColor, northSouthColor, nearestStation]);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.circleMarker([activeLocation.lat, activeLocation.lng], {
      radius: 10,
      fillColor: '#3B82F6',
      color: '#fff',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map);

    map.setView([activeLocation.lat, activeLocation.lng], 14);
  }, [activeLocation]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', background: '#1a1a2e' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      <SearchBar onLocationSelect={setSearchLocation} />

      {nearestStation && (
        <NearestStationCard
          station={nearestStation}
          onClick={() => setSelectedStation(nearestStation)}
        />
      )}

      {selectedStation && (
        <StationBottomSheet
          station={selectedStation as MetroStation & { lines?: ('east-west' | 'north-south')[] }}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
}
