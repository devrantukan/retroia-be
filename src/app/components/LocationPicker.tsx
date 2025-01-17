"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useFormContext } from "react-hook-form";

import axios from "axios";
import { Button } from "@nextui-org/react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  mode: "add" | "edit";
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
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral>({
      lat: lat || 41.015137,
      lng: lng || 28.97953,
    });

  const { setValue, register } = useFormContext<AddPropertyInputType>();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    language: "tr",
    region: "TR",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>("");
  const [tempAddress, setTempAddress] = useState<{
    streetAddress: string;
    zip: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [mapOptions, setMapOptions] = useState({});
  const [confirmedPosition, setConfirmedPosition] =
    useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setMapOptions({
        disableDefaultUI: false,
        clickableIcons: true,
        scrollwheel: true,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        mapTypeControl: true,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    const updateMapLocation = async () => {
      try {
        if (confirmedPosition) {
          if (map) {
            map.panTo(confirmedPosition);
          }
          return;
        }

        let locationString = "";
        let zoomLevel = 5;

        if (tempAddress) {
          return;
        }

        if (mode === "edit" && lat && lng) {
          setSelectedLocation({ lat, lng });
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
          return;
        }

        if (country && city && district && neighborhood) {
          locationString = `${neighborhood}, ${district}, ${city}, ${country}`;
          zoomLevel = 16;
        } else if (country && city && district) {
          locationString = `${district}, ${city}, ${country}`;
          zoomLevel = 14;
        } else if (country && city) {
          locationString = `${city}, ${country}`;
          zoomLevel = 11;
        } else if (country) {
          locationString = country;
          zoomLevel = 5;
        }

        if (locationString) {
          const response = await axios.get(`/api/location/get-coordinates`, {
            params: {
              location: locationString,
            },
          });

          if (response.data.candidates && response.data.candidates[0]) {
            const location = response.data.candidates[0].geometry.location;
            if (map) {
              const newPosition = { lat: location.lat, lng: location.lng };
              setSelectedLocation(newPosition);
              map.panTo(newPosition);
              map.setZoom(zoomLevel);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };

    updateMapLocation();
  }, [
    country,
    city,
    district,
    neighborhood,
    map,
    lat,
    lng,
    mode,
    confirmedPosition,
    tempAddress,
  ]);

  if (loadError) {
    return <div>Harita yüklenirken hata oluştu</div>;
  }

  if (!isLoaded) {
    return <div>Harita yükleniyor...</div>;
  }

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  };

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng && map) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      const newPosition = { lat: newLat, lng: newLng };

      setSelectedLocation(newPosition);
      setConfirmedPosition(newPosition);

      setValue("location.latitude", newLat, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("location.longitude", newLng, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      try {
        const response = await axios.get(`/api/location/reverse-geocode`, {
          params: { lat: newLat, lng: newLng },
        });

        if (response.data && response.data.results?.[0]) {
          const result = response.data.results[0];
          const components = result.address_components;

          const streetNumber =
            components.find((c: any) => c.types.includes("street_number"))
              ?.long_name || "";
          const route =
            components.find((c: any) => c.types.includes("route"))?.long_name ||
            "";
          const postalCode =
            components.find((c: any) => c.types.includes("postal_code"))
              ?.long_name || "";

          const streetAddress = `${streetNumber} ${route}`.trim();

          setTempAddress({
            streetAddress,
            zip: postalCode,
            lat: newLat,
            lng: newLng,
          });

          setGeocodedAddress(result.formatted_address);
        }
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
      }
    }
  };

  const handleUseAddress = () => {
    if (tempAddress) {
      const position = { lat: tempAddress.lat, lng: tempAddress.lng };
      setConfirmedPosition(position);
      setSelectedLocation(position);

      setValue("location.latitude", tempAddress.lat, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("location.longitude", tempAddress.lng, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("location.streetAddress", tempAddress.streetAddress, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("location.zip", tempAddress.zip, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setGeocodedAddress("");
      setTempAddress(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" {...register("location.latitude")} />
      <input type="hidden" {...register("location.longitude")} />

      <div className="h-[380px] md:h-[300px] w-full">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={selectedLocation}
          zoom={mode === "edit" && lat && lng ? 15 : 5}
          onLoad={onLoad}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {selectedLocation && <MarkerF position={selectedLocation} />}
        </GoogleMap>
      </div>
      {geocodedAddress && (
        <div className="flex flex-col gap-2 p-2 border rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Seçilen Adres:</p>
            <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {geocodedAddress}
            </p>
          </div>
          <Button
            className="mt-2 bg-blue-950 font-bold text-white"
            onClick={handleUseAddress}
          >
            Bu adresi kullan
          </Button>
        </div>
      )}
    </div>
  );
}
