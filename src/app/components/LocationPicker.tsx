"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "../user/properties/add/_components/AddPropertyForm";
import { Input } from "@nextui-org/react";

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyDMTvXdDIxkmlxtPmBRBEUvpwX1PtWQTr4";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function LocationPicker({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useFormContext<AddPropertyInputType>();

  // useEffect(() => {
  //   const values = getValues();
  //   if (values.location.latitude) {
  //     setLatitude(values.location.latitude);
  //   }
  //   if (values.location.longitude) {
  //     setLongitude(values.location.longitude);
  //   }
  // }, [getValues]);

  const center = {
    lat: lat,
    lng: lng,
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [latitude, setLatitude] = useState<number>(lat);
  const [longitude, setLongitude] = useState<number>(lng);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map | null) {
    setMap(null);
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setSelectedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
      setValue("location.latitude", event.latLng.lat());
      setLatitude(event.latLng.lat());
      setValue("location.longitude", event.latLng.lng());
      setLongitude(event.latLng.lng());
    }
  };

  return isLoaded ? (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Konum Seç</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          <Marker position={center} />
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
        {selectedLocation && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Selected Location:</h3>
            <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
            <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
          </div>
        )}
        <Input
          {...register("location.latitude", {
            valueAsNumber: true,
          })}
          errorMessage={errors.location?.latitude?.message}
          isInvalid={!!errors.location?.latitude}
          label="Enlem"
          value={latitude.toString()}
          {...(getValues().location && getValues().location.latitude
            ? {
                defaultValue: getValues().location?.latitude?.toString(),
              }
            : {})}
        />
        <Input
          {...register("location.longitude", {
            valueAsNumber: true,
          })}
          errorMessage={errors.location?.longitude?.message}
          isInvalid={!!errors.location?.longitude}
          label="Boylam"
          value={longitude.toString()}
          {...(getValues().location && getValues().location.longitude
            ? {
                defaultValue: getValues().location.longitude?.toString(),
              }
            : {})}
        />
      </CardContent>
    </Card>
  ) : (
    <></>
  );
}
