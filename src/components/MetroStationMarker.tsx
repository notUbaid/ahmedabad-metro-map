import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { MetroStation } from '@/types/metro';

interface MetroStationMarkerProps {
  station: MetroStation & { lines?: ('east-west' | 'north-south')[] };
  isNearest: boolean;
  onClick: (station: MetroStation) => void;
}

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

export function MetroStationMarker({ station, isNearest, onClick }: MetroStationMarkerProps) {
  return (
    <Marker
      position={[station.lat, station.lng]}
      icon={createMarkerIcon(station, isNearest)}
      eventHandlers={{
        click: () => onClick(station),
      }}
    >
      <Popup>
        <div className="font-sans">
          <strong>{station.name}</strong>
        </div>
      </Popup>
    </Marker>
  );
}
