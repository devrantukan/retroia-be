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
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
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

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={15}
        onClick={(e) => {
          if (e.latLng) {
            onLocationChange(e.latLng.lat(), e.latLng.lng());
            setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        }}
      >
        <MarkerF
          position={currentMarkerPosition}
          draggable={true}
          onDragEnd={(e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onLocationChange(e.latLng.lat(), e.latLng.lng());
              setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          }}
        />
      </GoogleMap>
    </div>
  );
}
