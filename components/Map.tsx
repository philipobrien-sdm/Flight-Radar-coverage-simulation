
import React, { useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Circle } from '@react-google-maps/api';
import { Aircraft, Airport, Point, Radar } from '../types';
import AircraftComponent from './AircraftComponent';
import RadarComponent from './RadarComponent';
import AirportComponent from './AirportComponent';

// FIX: Define minimal google.maps types to resolve namespace errors when @types/google.maps is not installed.
declare namespace google {
  namespace maps {
    interface MapOptions {
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      styles?: object[];
    }
    interface LatLng {
      lat(): number;
      lng(): number;
    }
    interface MapMouseEvent {
      latLng: LatLng | null;
    }
  }
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions: google.maps.MapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ],
};

const NM_TO_METERS = 1852;

// Custom OverlayView component to render React components on the map
const CustomOverlayView: React.FC<{ position: Point, children: React.ReactNode }> = ({ position, children }) => {
  return (
    <OverlayView
      position={{ lat: position.lat, lng: position.lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div style={{ transform: 'translate(-50%, -50%)' }}>
        {children}
      </div>
    </OverlayView>
  );
};


interface MapProps {
  apiKey: string;
  center: Point;
  zoom: number;
  aircrafts: Aircraft[];
  radars: Radar[];
  airports: Airport[];
  selectedAircraftId: string | null;
  selectedRadarId: string | null;
  onSelectAircraft: (id: string) => void;
  onSelectRadar: (id: string) => void;
  onDeselect: () => void;
  onToggleRadarStatus: (id: string) => void;
}

const MapComponent: React.FC<MapProps> = ({
  apiKey,
  center,
  zoom,
  aircrafts,
  radars,
  airports,
  selectedAircraftId,
  selectedRadarId,
  onSelectAircraft,
  onSelectRadar,
  onDeselect,
  onToggleRadarStatus,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const handleMapClick = useCallback(() => {
    onDeselect();
  }, [onDeselect]);

  const memoizedCenter = useMemo(() => ({ lat: center.lat, lng: center.lng }), [center.lat, center.lng]);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={memoizedCenter}
      zoom={zoom}
      options={mapOptions}
      onClick={handleMapClick}
    >
      <>
        {airports.map(airport => (
          <CustomOverlayView key={airport.code} position={airport.position}>
            <AirportComponent airport={airport} />
          </CustomOverlayView>
        ))}
        {radars.map(radar => (
          <React.Fragment key={radar.id}>
            <CustomOverlayView position={radar.position}>
              <RadarComponent
                radar={radar}
                isSelected={selectedRadarId === radar.id}
                onSelect={onSelectRadar}
                onToggleStatus={onToggleRadarStatus}
              />
            </CustomOverlayView>
            <Circle
              center={{ lat: radar.position.lat, lng: radar.position.lng }}
              radius={radar.range * NM_TO_METERS}
              options={{
                strokeColor: radar.isActive ? '#4ade80' : '#ef4444',
                strokeOpacity: radar.isActive ? 0.3 : 0.4,
                strokeWeight: 1,
                fillColor: radar.isActive ? '#4ade80' : '#ef4444',
                fillOpacity: radar.isActive ? 0.05 : 0.08,
              }}
            />
          </React.Fragment>
        ))}
        {aircrafts.map(aircraft => (
          <CustomOverlayView key={aircraft.id} position={aircraft.position}>
            <AircraftComponent
              aircraft={aircraft}
              isSelected={selectedAircraftId === aircraft.id}
              onSelect={onSelectAircraft}
            />
          </CustomOverlayView>
        ))}
      </>
    </GoogleMap>
  );
};

export default React.memo(MapComponent);
