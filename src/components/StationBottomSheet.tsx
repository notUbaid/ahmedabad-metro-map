import { X, Train, Clock, ArrowRight } from 'lucide-react';
import type { MetroStation } from '@/types/metro';
import { useTimetable } from '../hooks/useTimetable';

interface StationBottomSheetProps {
  station: MetroStation & { lines?: ('east-west' | 'north-south')[] };
  onClose: () => void;
}

export function StationBottomSheet({ station, onClose }: StationBottomSheetProps) {
  const lines = station.lines || (station.line ? [station.line] : []);
  const nextTrains = useTimetable(station.name);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 -top-[100vh] bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative glass-card rounded-t-2xl bottom-sheet-enter">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{station.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              {lines.map((line) => (
                <span
                  key={line}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    line === 'east-west'
                      ? 'bg-metro-blue/20 text-blue-400'
                      : 'bg-metro-red/20 text-red-400'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      line === 'east-west' ? 'bg-metro-blue' : 'bg-metro-red'
                    }`}
                  />
                  {line === 'east-west' ? 'East–West Line' : 'North–South Line'}
                </span>
              ))}
            </div>
            {station.interchange && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Train className="w-3.5 h-3.5" />
                Interchange Station
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Next Trains Section */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Next Trains
          </h3>
          <div className="space-y-3">
            {Object.keys(nextTrains).length > 0 ? (
              Object.entries(nextTrains).map(([direction, trains]) => (
                <div
                  key={direction}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        direction.includes('East') || direction.includes('West')
                          ? 'bg-metro-blue'
                          : 'bg-metro-red'
                      }`}
                    />
                    <p className="text-sm font-medium text-foreground">
                      {direction}
                    </p>
                  </div>
                  {trains.length > 0 ? (
                    trains.map((train, idx) => (
                      <div key={idx} className="flex items-center justify-between pl-4">
                        <span className="text-sm text-muted-foreground">
                          {train.time}
                        </span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <span className="text-sm">
                            {train.minutesAway <= 0 ? 'Due' : `in ${train.minutesAway} min`}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground pl-4">No more trains today</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No schedule data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
