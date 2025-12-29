import { Polyline } from 'react-leaflet';
import type { MetroStation } from '@/types/metro';

interface MetroLinesProps {
  eastWestStations: MetroStation[];
  northSouthStations: MetroStation[];
  eastWestColor: string;
  northSouthColor: string;
}

export function MetroLines({
  eastWestStations,
  northSouthStations,
  eastWestColor,
  northSouthColor,
}: MetroLinesProps) {
  const eastWestCoords = eastWestStations.map(s => [s.lat, s.lng] as [number, number]);
  const northSouthCoords = northSouthStations.map(s => [s.lat, s.lng] as [number, number]);

  return (
    <>
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
    </>
  );
}
