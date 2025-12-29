import { Navigation, Clock, MapPin } from 'lucide-react';
import type { NearestStation } from '@/types/metro';
import { formatDistance, formatWalkingTime } from '@/utils/distance';

interface NearestStationCardProps {
  station: NearestStation;
  onClick: () => void;
}

export function NearestStationCard({ station, onClick }: NearestStationCardProps) {
  const lineColor = station.line === 'east-west' || station.lines?.includes('east-west')
    ? 'bg-metro-blue'
    : 'bg-metro-red';

  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 left-4 right-4 z-[1000] max-w-md glass-card rounded-xl p-4 text-left hover:bg-muted/10 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${lineColor} flex items-center justify-center flex-shrink-0`}>
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Nearest Station
          </p>
          <h3 className="text-lg font-semibold text-foreground truncate">
            {station.name}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Navigation className="w-4 h-4" />
              <span>{formatDistance(station.distance)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatWalkingTime(station.walkingTime)} walk</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
