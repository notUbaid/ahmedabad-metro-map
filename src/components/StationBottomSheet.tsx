import { X, Train, Clock, ArrowRight } from 'lucide-react';
import type { MetroStation } from '@/types/metro';

interface StationBottomSheetProps {
  station: MetroStation & { lines?: ('east-west' | 'north-south')[] };
  onClose: () => void;
}

export function StationBottomSheet({ station, onClose }: StationBottomSheetProps) {
  const lines = station.lines || (station.line ? [station.line] : []);

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
          <div className="space-y-2">
            {lines.map((line) => (
              <div
                key={line}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      line === 'east-west' ? 'bg-metro-blue' : 'bg-metro-red'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {line === 'east-west' ? 'Vastral – Thaltej' : 'Motera – APMC'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {line === 'east-west' ? 'East–West Line' : 'North–South Line'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">--:-- min</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Real-time schedules coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
