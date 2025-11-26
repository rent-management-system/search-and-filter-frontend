# Gebeta Maps Integration Guide

This guide explains how to use Gebeta Maps in your application to display property locations.

## Setup

### 1. Install the Package
The `@gebeta/tiles` package has already been installed in this project.

### 2. Get Your API Key
1. Visit [https://gebeta.app/](https://gebeta.app/)
2. Register for an account
3. Get your API key from the dashboard

### 3. Add API Key to Environment Variables
Open the `.env` file and replace `YOUR_GEBETA_MAPS_API_KEY` with your actual API key:

```env
VITE_GEBETA_MAPS_API_KEY=your_actual_api_key_here
```

## Usage

### Basic Map Display

The `MapView` component has been integrated into the `PropertyCard` component. It will automatically display when a property has `lat` and `lon` coordinates.

```tsx
import { MapView } from '@/components/MapView';

<MapView
  latitude={9.0161}
  longitude={38.7685}
  title="Property Location"
  zoom={15}
  markerColor="#3B82F6"
  showFullscreenButton={true}
  className="h-96"
/>
```

### Component Props

- **latitude** (required): Latitude coordinate
- **longitude** (required): Longitude coordinate  
- **title** (optional): Title displayed in fullscreen mode
- **zoom** (optional): Initial zoom level (default: 14)
- **markerColor** (optional): Color of the marker (default: "#FF0000")
- **showFullscreenButton** (optional): Show/hide fullscreen button (default: true)
- **className** (optional): Additional CSS classes

### Property Data Structure

For the map to display in PropertyCard, your property object should include:

```typescript
{
  lat: 9.0161,      // Latitude
  lon: 38.7685,     // Longitude
  title: "Property Name",
  location: "Addis Ababa, Ethiopia",
  // ... other property fields
}
```

## Features

### 1. Interactive Map
- Pan and zoom controls
- Click and drag to navigate
- Scroll to zoom

### 2. Location Marker
- Automatically placed at property coordinates
- Customizable color

### 3. Fullscreen Mode
- Click the maximize button to view in fullscreen
- Shows property title and coordinates
- Close button to exit fullscreen

### 4. "View on Map" Button
The PropertyCard component now includes a "View on Map" button that:
- Opens the details dialog with the map displayed
- Shows when property has coordinates OR a map URL
- Includes a map pin icon for better UX

## Integration Points

### PropertyCard Component
The map is integrated in the details dialog (lines 754-796 of PropertyCard.tsx):

1. **Priority 1**: If property has `lat` and `lon`, displays Gebeta Map
2. **Priority 2**: If property has `mapUrl`, displays iframe
3. **Fallback**: Shows placeholder with message

### Example Property with Coordinates

```typescript
const property = {
  id: "123",
  title: "Modern Apartment",
  location: "Bole, Addis Ababa",
  lat: 9.0161,
  lon: 38.7685,
  price: 15000,
  house_type: "apartment",
  // ... other fields
};
```

## Troubleshooting

### Map Not Displaying

1. **Check API Key**: Ensure `VITE_GEBETA_MAPS_API_KEY` is set in `.env`
2. **Restart Dev Server**: After adding the API key, restart your development server
3. **Check Coordinates**: Verify `lat` and `lon` are valid numbers
4. **Check Console**: Look for error messages in browser console

### Invalid Coordinates Error

The map validates coordinates:
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Both must be valid numbers

### API Key Warning

If you see "Gebeta Maps API Key Required":
- The API key is missing or set to the default placeholder
- Add your actual API key to `.env`
- Restart the development server

## Advanced Usage

For more advanced features like clustering, geocoding, or directions, refer to the [Gebeta Maps React SDK documentation](https://github.com/AfriGebeta/gebeta-tiles).

### Adding Custom Markers

You can extend the MapView component to add custom image markers:

```typescript
// In the handleMapLoaded function
mapRef.current?.addImageMarker(
  [longitude, latitude],
  "https://your-custom-marker-icon.png",
  [40, 40], // size
  () => console.log('Marker clicked!'),
  10, // z-index
  "<b>Custom Popup</b>"
);
```

## Support

For issues with:
- **Gebeta Maps SDK**: Visit [GitHub Issues](https://github.com/AfriGebeta/gebeta-tiles/issues)
- **This Integration**: Check the component files in `src/components/`
