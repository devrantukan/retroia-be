"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useFormContext } from "react-hook-form";

import axios from "axios";
import { Button } from "@nextui-org/react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  country?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  mode?: "edit" | "add";
  onMapClick: (lat: number, lng: number) => void;
  markerPosition: { lat: number; lng: number } | null;
  setMarkerPosition: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
}

export interface AddPropertyInputType {
  location: {
    streetAddress: string;
    zip: string;
    latitude: number;
    longitude: number;
    country: string;
    city: string;
    district: string;
    neighborhood: string;
  };
}

export default function LocationPicker({
  lat,
  lng,
  country,
  city,
  district,
  neighborhood,
  mode,
  onMapClick,
  markerPosition,
  setMarkerPosition,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const mapCenter = useMemo(
    () => ({
      lat: markerPosition?.lat || lat || 41.0082,
      lng: markerPosition?.lng || lng || 28.9784,
    }),
    [markerPosition, lat, lng]
  );

  const currentMarkerPosition = useMemo(
    () => ({
      lat: markerPosition?.lat || lat || mapCenter.lat,
      lng: markerPosition?.lng || lng || mapCenter.lng,
    }),
    [markerPosition, lat, lng, mapCenter]
  );

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "400px" }}
      center={mapCenter}
      zoom={15}
      onClick={(e) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      }}
    >
      <MarkerF
        position={currentMarkerPosition}
        draggable={true}
        onDragEnd={(e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        }}
      />
    </GoogleMap>
  );
}
