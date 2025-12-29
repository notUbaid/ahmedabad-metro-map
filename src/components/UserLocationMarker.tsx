import { useEffect } from 'react';
import { useMap, CircleMarker, Circle } from 'react-leaflet';
import type { UserLocation } from '@/types/metro';

interface UserLocationMarkerProps {
  location: UserLocation;
}

export function UserLocationMarker({ location }: UserLocationMarkerProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng], 14);
  }, [map, location.lat, location.lng]);

  return (
    <>
      {/* Pulse ring */}
      <Circle
        center={[location.lat, location.lng]}
        radius={100}
        pathOptions={{
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.15,
          weight: 0,
        }}
        className="user-location-pulse"
      />
      {/* Inner circle */}
      <CircleMarker
        center={[location.lat, location.lng]}
        radius={8}
        pathOptions={{
          color: '#ffffff',
          fillColor: '#3B82F6',
          fillOpacity: 1,
          weight: 3,
        }}
      />
    </>
  );
}
