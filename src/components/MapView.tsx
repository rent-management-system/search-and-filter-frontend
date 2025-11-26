import { useState } from 'react';
import GebetaMap from '@gebeta/tiles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  markerColor?: string;
  showFullscreenButton?: boolean;
  className?: string;
}

export const MapView = ({
  latitude,
  longitude,
  title = 'Property Location',
  zoom = 14,
  markerColor = '#FF0000',
  showFullscreenButton = true,
  className = '',
}: MapViewProps) => {
  const apiKey = import.meta.env.VITE_GEBETA_MAPS_API_KEY;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Validate coordinates
  const isValidCoordinates = 
    typeof latitude === 'number' && 
    typeof longitude === 'number' &&
    !isNaN(latitude) && 
    !isNaN(longitude) &&
    latitude >= -90 && 
    latitude <= 90 &&
    longitude >= -180 && 
    longitude <= 180;

  if (!apiKey || apiKey === 'YOUR_GEBETA_MAPS_API_KEY' || apiKey === 'your_gebeta_maps_api_key_here') {
    return (
      <Card className={`p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ${className}`}>
        <div className="text-center space-y-2">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            Gebeta Maps API Key Required
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Please add your Gebeta Maps API key to the .env file
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Get your API key at{' '}
            <a
              href="https://mapapi.gebeta.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-800"
            >
              mapapi.gebeta.app
            </a>
          </p>
        </div>
      </Card>
    );
  }

  if (!isValidCoordinates) {
    return (
      <Card className={`p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${className}`}>
        <div className="text-center space-y-2">
          <p className="font-semibold text-red-800 dark:text-red-200">
            Invalid Coordinates
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Latitude: {latitude}, Longitude: {longitude}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`overflow-hidden ${className}`}>
        <div className="relative h-96 w-full">
          <GebetaMap
            apiKey={apiKey}
            center={[longitude, latitude]}
            zoom={zoom}
            style={{ width: '100%', height: '100%' }}
          />
          
          {showFullscreenButton && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 shadow-lg z-10"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative h-[90vh]">
            <div className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 z-10 shadow-lg"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            <GebetaMap
              apiKey={apiKey}
              center={[longitude, latitude]}
              zoom={zoom}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Compact map view for property cards
export const CompactMapView = ({
  latitude,
  longitude,
  title,
}: {
  latitude: number;
  longitude: number;
  title?: string;
}) => {
  return (
    <MapView
      latitude={latitude}
      longitude={longitude}
      title={title}
      zoom={13}
      markerColor="#3B82F6"
      showFullscreenButton={true}
      className="h-64"
    />
  );
};
