# How to Get Exact Metro Station Coordinates

Since the coordinates need to be exact, here's how to get them from your Leaflet map:

1. Open your app in the browser
2. Right-click on a station location on the map
3. Open browser console (F12)
4. Run this JavaScript to get coordinates:

```javascript
// Click on the map and get coordinates
map.on('click', function(e) {
    console.log('Lat:', e.latlng.lat, 'Lng:', e.latlng.lng);
});
```

Or use Leaflet's built-in coordinate display.

## Current Issue

The stations need to be positioned exactly where they appear on your reference map. The current coordinates are approximate and need to be updated with exact values.

Please provide the exact coordinates for each station, or I can help you create a tool to extract them from your map.

