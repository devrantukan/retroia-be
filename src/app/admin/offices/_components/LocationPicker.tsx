"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBRARIES: "places"[] = ["places"];

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onZoomChange,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    return null;
  });

  const [zoom, setZoom] = useState(15);

  const mapCenter = useMemo(
    () => ({
      lat: markerPosition?.lat || latitude || 41.0082,
      lng: markerPosition?.lng || longitude || 28.9784,
    }),
    [markerPosition, latitude, longitude]
  );

  const currentMarkerPosition = useMemo(
    () => ({
      lat: markerPosition?.lat || latitude || mapCenter.lat,
      lng: markerPosition?.lng || longitude || mapCenter.lng,
    }),
    [markerPosition, latitude, longitude, mapCenter]
  );

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleMarkerMove = (lat: number, lng: number) => {
    onLocationChange(lat, lng);
    setMarkerPosition({ lat, lng });
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Zoom Level:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={zoom}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-500">{zoom}x</span>
      </div>
      <div className="w-full h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={zoom}
          onClick={(e) => {
            if (e.latLng) {
              handleMarkerMove(e.latLng.lat(), e.latLng.lng());
            }
          }}
          onZoomChanged={() => {
            const map = document.querySelector(".gm-style") as HTMLElement;
            if (map) {
              const zoomLevel = map
                .getAttribute("aria-label")
                ?.match(/zoom level (\d+)/)?.[1];
              if (zoomLevel) {
                handleZoomChange(Number(zoomLevel));
              }
            }
          }}
        >
          <MarkerF
            position={currentMarkerPosition}
            draggable={true}
            onDragEnd={(e: google.maps.MapMouseEvent) => {
              if (e.latLng) {
                handleMarkerMove(e.latLng.lat(), e.latLng.lng());
              }
            }}
          />
        </GoogleMap>
      </div>
    </div>
  );
}
