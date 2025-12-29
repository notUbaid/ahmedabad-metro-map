import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useNominatimSearch } from '@/hooks/useNominatimSearch';
import type { UserLocation } from '@/types/metro';

interface SearchBarProps {
  onLocationSelect: (location: UserLocation) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, search, clearResults } = useNominatimSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(query);
      }, 300);
    } else {
      clearResults();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search, clearResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lat: string, lng: string) => {
    onLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setQuery('');
    setIsOpen(false);
    clearResults();
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="absolute top-4 left-4 right-4 z-[1000] max-w-md">
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search places in Ahmedabad..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm search-input"
          />
          {loading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
          {query && !loading && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {isOpen && results.length > 0 && (
          <div className="border-t border-border">
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelect(result.lat, result.lon)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
