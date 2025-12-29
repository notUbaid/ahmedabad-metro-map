import { useMemo } from 'react';
import metroData from '@/data/metroStations.json';
import type { MetroStation, MetroData, NearestStation, UserLocation } from '@/types/metro';
import { calculateDistance, calculateWalkingTime } from '@/utils/distance';

export function useMetroData() {
  const data = metroData as MetroData;

  const allStations = useMemo(() => {
    const stationMap = new Map<string, MetroStation & { lines: ('east-west' | 'north-south')[] }>();

    // Process East-West line
    data.lines['east-west'].stations.forEach(station => {
      const existing = stationMap.get(station.name);
      if (existing) {
        existing.lines.push('east-west');
      } else {
        stationMap.set(station.name, {
          ...station,
          line: 'east-west',
          lines: ['east-west'],
        });
      }
    });

    // Process North-South line
    data.lines['north-south'].stations.forEach(station => {
      const existing = stationMap.get(station.name);
      if (existing) {
        existing.lines.push('north-south');
      } else {
        stationMap.set(station.name, {
          ...station,
          line: 'north-south',
          lines: ['north-south'],
        });
      }
    });

    return Array.from(stationMap.values());
  }, [data]);

  const findNearestStation = (location: UserLocation): NearestStation | null => {
    if (allStations.length === 0) return null;

    let nearest: NearestStation | null = null;
    let minDistance = Infinity;

    allStations.forEach(station => {
      const distance = calculateDistance(location.lat, location.lng, station.lat, station.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          ...station,
          distance,
          walkingTime: calculateWalkingTime(distance),
        };
      }
    });

    return nearest;
  };

  const eastWestStations = data.lines['east-west'].stations;
  const northSouthStations = data.lines['north-south'].stations;
  const eastWestColor = data.lines['east-west'].color;
  const northSouthColor = data.lines['north-south'].color;

  return {
    allStations,
    eastWestStations,
    northSouthStations,
    eastWestColor,
    northSouthColor,
    findNearestStation,
  };
}
