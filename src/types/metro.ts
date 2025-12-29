export interface MetroStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  interchange: boolean;
  line?: 'east-west' | 'north-south';
  lines?: ('east-west' | 'north-south')[];
}

export interface MetroLine {
  name: string;
  color: string;
  stations: MetroStation[];
}

export interface MetroData {
  lines: {
    'east-west': MetroLine;
    'north-south': MetroLine;
    'north-south-branch'?: MetroLine;
  };
}

export interface NearestStation extends MetroStation {
  distance: number;
  walkingTime: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}
