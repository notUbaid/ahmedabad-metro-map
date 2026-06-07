import { useState, useEffect, useMemo } from 'react';
import trainJourneysData from '../data/trainJourneys.json';
import { useMetroData } from './useMetroData';

type TrainStation = {
  order: number;
  name: string;
  arrivalTime: string;
  departureTime: string;
};

type TrainJourney = {
  id: string;
  uniqueId: string;
  direction: string;
  dayType: string;
  route: string;
  stations: TrainStation[];
};

export type ActiveTrain = {
  id: string;
  uniqueId: string;
  lat: number;
  lng: number;
  direction: string;
  route: string;
};

const timeToSeconds = (timeStr: string) => {
  if (!timeStr || timeStr === 'TERMINUS') return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parts.length > 2 ? parseInt(parts[2], 10) : 0;
  return h * 3600 + m * 60 + s;
};

export function useAnimatedTrains() {
  const [activeTrains, setActiveTrains] = useState<ActiveTrain[]>([]);
  const { allStations } = useMetroData();

  // Pre-parse the journey times into seconds for performance
  const parsedJourneys = useMemo(() => {
    const journeys = Object.values(trainJourneysData as Record<string, TrainJourney>);
    return journeys.map((train) => ({
      ...train,
      stations: train.stations.map((st) => ({
        ...st,
        arrSec: timeToSeconds(st.arrivalTime),
        depSec: timeToSeconds(st.departureTime) || timeToSeconds(st.arrivalTime),
      })).filter((st) => st.arrSec !== null || st.depSec !== null),
    }));
  }, []);

  useEffect(() => {
    if (allStations.length === 0) return;

    const stationCoords = new Map(allStations.map((s) => [s.name, { lat: s.lat, lng: s.lng }]));

    let animationFrameId: number;

    const animate = () => {
      const now = new Date();
      const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
      const currentDay = now.getDay();
      const isWeekend = currentDay === 0 || currentDay === 6;

      const active: ActiveTrain[] = [];

      for (let i = 0; i < parsedJourneys.length; i++) {
        const train = parsedJourneys[i];

        if (train.dayType === 'Mon-Fri' && isWeekend) continue;
        if (train.dayType === 'Saturday' && currentDay !== 6) continue;
        if (train.dayType === 'Sunday' && currentDay !== 0) continue;

        const stations = train.stations;
        if (stations.length < 2) continue;

        const firstSec = stations[0].depSec ?? stations[0].arrSec;
        const lastSec = stations[stations.length - 1].arrSec ?? stations[stations.length - 1].depSec;

        if (firstSec === null || lastSec === null) continue;

        // If the current time is within the train's full journey
        if (currentSeconds >= firstSec && currentSeconds <= lastSec) {
          let lat = 0;
          let lng = 0;
          let found = false;

          for (let j = 0; j < stations.length - 1; j++) {
            const currentStation = stations[j];
            const nextStation = stations[j + 1];

            const depSec = currentStation.depSec;
            const arrSec = nextStation.arrSec;

            if (depSec === null || arrSec === null) continue;

            if (currentSeconds >= depSec && currentSeconds <= arrSec) {
              // Train is moving between stations
              const progress = (currentSeconds - depSec) / (arrSec - depSec);
              const startCoord = stationCoords.get(currentStation.name);
              const endCoord = stationCoords.get(nextStation.name);

              if (startCoord && endCoord) {
                lat = startCoord.lat + (endCoord.lat - startCoord.lat) * progress;
                lng = startCoord.lng + (endCoord.lng - startCoord.lng) * progress;
                found = true;
              }
              break;
            } else if (currentSeconds < depSec && j > 0) {
              // Train is waiting at the current station
              const arrAtCurrent = currentStation.arrSec;
              if (arrAtCurrent !== null && currentSeconds >= arrAtCurrent && currentSeconds < depSec) {
                const coord = stationCoords.get(currentStation.name);
                if (coord) {
                  lat = coord.lat;
                  lng = coord.lng;
                  found = true;
                }
              }
              break;
            } else if (j === 0 && currentSeconds < depSec) {
               // Waiting to depart first station
               const coord = stationCoords.get(currentStation.name);
                if (coord) {
                  lat = coord.lat;
                  lng = coord.lng;
                  found = true;
                }
                break;
            }
          }

          if (found) {
            active.push({
              id: train.id,
              uniqueId: train.uniqueId,
              lat,
              lng,
              direction: train.direction,
              route: train.route,
            });
          }
        }
      }

      setActiveTrains(active);
      
      // We run at 60fps for smooth animation
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [allStations, parsedJourneys]);

  return activeTrains;
}
