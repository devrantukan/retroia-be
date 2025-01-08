"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "../user/properties/add/_components/AddPropertyForm";
import { Input } from "@nextui-org/react";
import axios from "axios";
import { Button } from "@nextui-org/react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "400px",
};

interface LocationPickerProps {
  lat: number;
  lng: number;
  country: string;
  city: string;
  district: string;
}

export default function LocationPicker({
  lat,
  lng,
  country,
  city,
  district,
}: LocationPickerProps) {
  const [isInitialPin, setIsInitialPin] = useState(true);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral>({
      lat: lat || 41.015137,
      lng: lng || 28.97953,
    });

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

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    language: "tr",
    region: "TR",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [latitude, setLatitude] = useState<number>(lat);
  const [longitude, setLongitude] = useState<number>(lng);

  const [geocodedAddress, setGeocodedAddress] = useState<string>("");
  const [tempAddress, setTempAddress] = useState<{
    streetAddress: string;
    zip: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [mapOptions, setMapOptions] = useState({});

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
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    if (map && latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude };
      setSelectedLocation(newPosition);
      map.panTo(newPosition);
    }
  }, [latitude, longitude, map]);

  useEffect(() => {
    const updateMapLocation = async () => {
      try {
        let locationString = "";
        let zoomLevel = 5;

        // Determine location string and zoom level based on available data
        if (country && city && district) {
          locationString = `${district}, ${city}, ${country}`;
          zoomLevel = 14; // District level
        } else if (country && city) {
          locationString = `${city}, ${country}`;
          zoomLevel = 11; // City level
        } else if (country) {
          locationString = country;
          zoomLevel = 5; // Country level
        }

        if (locationString) {
          console.log("Updating map with:", locationString);

          const response = await axios.get(`/api/location/get-coordinates`, {
            params: {
              location: locationString,
            },
          });

          if (response.data.candidates && response.data.candidates[0]) {
            const location = response.data.candidates[0].geometry.location;
            console.log("Received coordinates:", location);

            // Update states
            setLatitude(location.lat);
            setLongitude(location.lng);

            // Update map
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
  }, [country, city, district, map]); // Watch all location changes

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);

    // Show initial pin if coordinates exist
    if (latitude && longitude && latitude !== 0 && longitude !== 0) {
      const position = { lat: latitude, lng: longitude };
      setSelectedLocation(position);
    }
  };

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng && map) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      const newPosition = { lat: newLat, lng: newLng };

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

          // Store temporary values
          setTempAddress({
            streetAddress,
            zip: postalCode,
            lat: newLat,
            lng: newLng,
          });

          // Show full address for confirmation
          setGeocodedAddress(result.formatted_address);

          // Update marker position
          setSelectedLocation(newPosition);
          map.panTo(newPosition);
        }
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
      }
    }
  };

  const handleUseAddress = () => {
    if (tempAddress) {
      // Update form values
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

      // Update state values
      setLatitude(tempAddress.lat);
      setLongitude(tempAddress.lng);

      // Clear temporary data
      setGeocodedAddress("");
      setTempAddress(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {latitude && longitude && latitude !== 0 && longitude !== 0 ? (
        <>
          <div className="h-[380px] md:h-[300px] w-full">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={selectedLocation}
              zoom={15}
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
        </>
      ) : (
        <div className="h-[600px] md:h-[750px] flex items-center justify-center text-center p-4 text-gray-500">
          Haritayı görmek için lütfen önce mahalle seçiniz
        </div>
      )}
      <Input
        type="hidden"
        className="hidden"
        {...register("location.latitude", { valueAsNumber: true })}
      />
      <Input
        type="hidden"
        className="hidden"
        {...register("location.longitude", { valueAsNumber: true })}
      />
    </div>
  );
}
