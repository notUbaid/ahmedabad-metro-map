import { useState, useEffect, useMemo } from 'react';
import trainJourneysData from '../data/trainJourneys.json';

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

export interface NextTrain {
  direction: string;
  time: string;
  minutesAway: number;
}

export function useTimetable(stationName: string | undefined) {
  const [nextTrains, setNextTrains] = useState<Record<string, NextTrain[]>>({});

  const parsedJourneys = useMemo(() => {
    return Object.values(trainJourneysData as Record<string, TrainJourney>);
  }, []);

  useEffect(() => {
    if (!stationName) {
      setNextTrains({});
      return;
    }

    const updateTrains = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const isWeekend = currentDay === 0 || currentDay === 6;
      
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      // Map of direction -> array of valid arrival times
      const stationTimings: Record<string, string[]> = {};

      for (const train of parsedJourneys) {
        if (train.dayType === 'Mon-Fri' && isWeekend) continue;
        if (train.dayType === 'Saturday' && currentDay !== 6) continue;
        if (train.dayType === 'Sunday' && currentDay !== 0) continue;

        const stationStop = train.stations.find((st) => st.name === stationName);
        if (stationStop) {
          if (!stationTimings[train.direction]) {
            stationTimings[train.direction] = [];
          }
          const timeToUse = stationStop.departureTime === 'TERMINUS' || !stationStop.departureTime 
                            ? stationStop.arrivalTime 
                            : stationStop.departureTime;
          
          if (timeToUse && timeToUse !== 'TERMINUS') {
            const parts = timeToUse.split(':');
            if (parts.length >= 2) {
              const hhmm = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
              stationTimings[train.direction].push(hhmm);
            }
          }
        }
      }

      const result: Record<string, NextTrain[]> = {};

      for (const [direction, times] of Object.entries(stationTimings)) {
        // Remove duplicates and sort
        const uniqueTimes = [...new Set(times)].sort();

        const upcoming = uniqueTimes.filter((t) => {
          const [h, m] = t.split(':').map(Number);
          const tTotalMinutes = h * 60 + m;
          return tTotalMinutes >= currentTotalMinutes;
        }).slice(0, 2);

        result[direction] = upcoming.map((t) => {
          const [h, m] = t.split(':').map(Number);
          const tTotalMinutes = h * 60 + m;
          return {
            direction,
            time: t,
            minutesAway: tTotalMinutes - currentTotalMinutes,
          };
        });
      }

      setNextTrains(result);
    };

    updateTrains();
    // Update every minute to keep the countdown fresh
    const interval = setInterval(updateTrains, 60000);
    return () => clearInterval(interval);
  }, [stationName, parsedJourneys]);

  return nextTrains;
}
