import { useEffect, useRef, useState } from 'react';
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
  const markersRef = useRef<L.CircleMarker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const hasInitializedRef = useRef(false);
  const hasCenteredOnUserRef = useRef(false);

  const { location: userLocation } = useGeolocation();
  const {
    allStations,
    eastWestStations,
    northSouthStations,
    branchStations,
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
    const loc = searchLocation || userLocation || { lat: 23.1000, lng: 72.5800 };
    const nearest = findNearestStation(loc);
    setNearestStation(nearest);
  }, [searchLocation, userLocation, findNearestStation]);

  // Initialize map (only once)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [23.1000, 72.5800], // Center between Ahmedabad and Gandhinagar
      zoom: 11, // Zoomed out to show entire metro network
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw metro lines (only once, lines don't change)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasInitializedRef.current) return;

    // Draw East-West line
    const ewCoords = eastWestStations.map(s => [s.lat, s.lng] as L.LatLngTuple);
    const ewLine = L.polyline(ewCoords, { 
      color: eastWestColor, 
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    // Draw North-South main line
    const nsCoords = northSouthStations.map(s => [s.lat, s.lng] as L.LatLngTuple);
    const nsLine = L.polyline(nsCoords, { 
      color: northSouthColor, 
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    // Draw branch line: GNLU → PDEU → Gift City
    if (branchStations.length > 0) {
      const branchCoords = branchStations.map(s => [s.lat, s.lng] as L.LatLngTuple);
      const branchLine = L.polyline(branchCoords, {
        color: northSouthColor,
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
      
      polylinesRef.current = [ewLine, nsLine, branchLine];
    } else {
      polylinesRef.current = [ewLine, nsLine];
    }

    hasInitializedRef.current = true;
  }, [eastWestStations, northSouthStations, branchStations, eastWestColor, northSouthColor]);

  // Add/update station markers (only when stations or nearest station changes)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasInitializedRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add station markers
    allStations.forEach(station => {
      const isEastWest = station.line === 'east-west' || station.lines?.includes('east-west');
      const isNearest = nearestStation?.id === station.id;
      const size = isNearest ? 14 : 10;
      
      // Interchange stations get white fill with colored border, otherwise use line color
      // Blue (#3B82F6) for EW line, Red (#EF4444) for NS line
      let fillColor: string;
      let borderColor: string;
      
      if (station.interchange) {
        fillColor = '#FFFFFF'; // White for interchange stations
        // Use purple border if serves both lines, otherwise use the line color
        if (station.lines?.includes('east-west') && station.lines?.includes('north-south')) {
          borderColor = '#8B5CF6'; // Purple border for dual-line interchange
        } else {
          borderColor = isEastWest ? '#3B82F6' : '#EF4444';
        }
      } else {
        fillColor = isEastWest ? '#3B82F6' : '#EF4444'; // Blue for EW, Red for NS
        borderColor = '#fff';
      }

      const marker = L.circleMarker([station.lat, station.lng], {
        radius: size,
        fillColor: fillColor,
        color: borderColor,
        weight: isNearest ? 4 : (station.interchange ? 3 : 3),
        fillOpacity: 1,
      }).addTo(map);

      marker.bindPopup(`${station.name}<br>Lat: ${station.lat.toFixed(6)}, Lng: ${station.lng.toFixed(6)}`);
      marker.on('click', () => {
        setSelectedStation(station);
        // Log coordinates to console for easy copying
        console.log(`${station.name}: { "lat": ${station.lat}, "lng": ${station.lng} }`);
      });
      markersRef.current.push(marker);
    });
  }, [allStations, nearestStation]);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Update user location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 10,
      fillColor: '#3B82F6',
      color: '#fff',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map);

    // Center map on user location only on first load
    if (!hasCenteredOnUserRef.current) {
      map.setView([userLocation.lat, userLocation.lng], 14, {
        animate: true,
        duration: 0.5,
      });
      hasCenteredOnUserRef.current = true;
    }
  }, [userLocation]);

  // Center map when search location is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !searchLocation) return;

    map.setView([searchLocation.lat, searchLocation.lng], 14, {
      animate: true,
      duration: 0.5,
    });
  }, [searchLocation]);

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
