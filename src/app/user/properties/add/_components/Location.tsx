import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Textarea,
  cn,
  Spinner,
} from "@nextui-org/react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";
import { City, Country, District, Neighborhood } from "@prisma/client";
import { set } from "zod";
import LocationMap from "@/app/components/LocationPicker";
import LocationPicker from "@/app/components/LocationPicker";
import axios from "axios";
import { debounce } from "lodash";

interface Props {
  next: () => void;
  prev: () => void;
  className?: string;
  countries: Country[];
  cities: City[];
  //  districts: District[];
  citiesObj: Record<any, any[]>; // Add this line
  // districtsObj: Record<any, any[]>;
  // neighborhoods: Neighborhood[];
  // neighborhoodsObj: Record<any, any[]>;
  isEdit: boolean;
  propertyLocation?: {
    id?: number;
    streetAddress?: string;
    city: string;
    state?: string;
    zip?: string;
    country: string;
    landmark?: string;
    district: string;
    neighborhood: string;
    region?: string;
    latitude: number;
    longitude: number;
    propertyId?: number;
  } | null;
}
const Location = (props: Props) => {
  // console.log("nb obj:", props.neighborhoodsObj);
  // console.log("nb:", props.neighborhoods);
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
    formState: { isDirty },
  } = useFormContext<AddPropertyInputType>();

  // Initialize states with DB values
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");

  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [latitude, setLatitude] = React.useState<number>(
    getValues().location?.latitude ?? 0
  );

  //console.log(latitude);
  const [longitude, setLongitude] = React.useState<number>(
    getValues().location?.longitude ?? 0
  );
  // console.log("city ops", cityOptions);
  // console.log("city ops", neighborhoodOptions);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);

  const [key, setKey] = useState(0);

  // Initialize marker position from DB in edit mode
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    if (props.isEdit) {
      const values = getValues();
      const lat = Number(values.location?.latitude);
      const lng = Number(values.location?.longitude);
      return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
    }
    return null;
  });

  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Initialize coordinates for edit mode
  useEffect(() => {
    if (props.isEdit && initialLoad) {
      const values = getValues();
      const lat = Number(values.location?.latitude);
      const lng = Number(values.location?.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        setMarkerPosition({ lat, lng });
        setInitialLoad(false);
      }
    }
  }, [props.isEdit, getValues, initialLoad]);

  // Update map based on selected location
  const updateMapFromLocation = useCallback(
    async (locationData: {
      country?: string;
      city?: string;
      district?: string;
      neighborhood?: string;
    }) => {
      const { country, city, district, neighborhood } = locationData;

      if (!country || !city) return;

      setIsLoadingCoordinates(true);
      try {
        const locationParts = [
          neighborhood ? `${neighborhood} Mahallesi` : "",
          district ? `${district} İlçesi` : "",
          city ? `${city} İli` : "",
          country,
        ].filter(Boolean);

        const locationString = locationParts.join(", ");
        console.log("Fetching coordinates for:", locationString);

        const response = await axios.get(`/api/location/get-coordinates`, {
          params: {
            location: locationString,
            region: "tr",
          },
        });

        // Handle the new response format
        if (response.data.candidates && response.data.candidates[0]) {
          const result = response.data.candidates[0];
          const location = result.geometry.location;

          console.log("Received location data:", result);

          setValue("location.latitude", Number(location.lat), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          setValue("location.longitude", Number(location.lng), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });

          setMarkerPosition({ lat: location.lat, lng: location.lng });

          // If viewport is available, we can use it to set the map bounds
          if (result.geometry.viewport) {
            console.log("Setting viewport:", result.geometry.viewport);
          }

          console.log("Updated coordinates for:", locationString, {
            lat: location.lat,
            lng: location.lng,
            address: result.formatted_address,
          });
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
        setIsLoadingCoordinates(false);
      }
    },
    [setValue]
  );

  // Handle select changes
  const handleCountryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setValue("location.country", selectedCountry);

    // Reset other fields
    setCity("");
    setValue("location.city", "");
    setDistrict("");
    setValue("location.district", "");
    setNeighborhood("");
    setValue("location.neighborhood", "");

    if (!props.isEdit) {
      await updateMapFromLocation({ country: selectedCountry });
    }
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setValue("location.city", selectedCity);

    // Reset dependent fields
    setDistrict("");
    setValue("location.district", "");
    setNeighborhood("");
    setValue("location.neighborhood", "");

    if (selectedCity) {
      fetchDistricts(selectedCity);
      await updateMapFromLocation({
        country: watch("location.country"),
        city: selectedCity,
      });
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedDistrict = e.target.value;
    setDistrict(selectedDistrict);
    setValue("location.district", selectedDistrict);

    // Reset neighborhood
    setNeighborhood("");
    setValue("location.neighborhood", "");

    if (city && selectedDistrict) {
      fetchNeighborhoods(city, selectedDistrict);
      await updateMapFromLocation({
        country: watch("location.country"),
        city: watch("location.city"),
        district: selectedDistrict,
      });
    }
  };

  const handleNeighborhoodChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedNeighborhood = e.target.value;
    setNeighborhood(selectedNeighborhood);
    setValue("location.neighborhood", selectedNeighborhood);

    await updateMapFromLocation({
      country: watch("location.country"),
      city: watch("location.city"),
      district: watch("location.district"),
      neighborhood: selectedNeighborhood,
    });
  };

  useEffect(() => {
    if (country) {
      setCityOptions(props.citiesObj[country] || []);
      setCity("");
      setDistrict("");
      setNeighborhood("");
    }
  }, [country, props.citiesObj]);

  useEffect(() => {
    if (city) {
      //  setDistrictOptions(props.districtsObj[city] || []);
      fetchDistricts(city);
      setDistrict("");
      setNeighborhood("");
    }
  }, [city]);

  useEffect(() => {
    if (district && city) {
      fetchNeighborhoods(city, district);
      setNeighborhood("");
    }
  }, [district, city]);

  async function fetchDistricts(city_slug: string) {
    setIsLoadingDistricts(true);
    try {
      const response = await axios.get(
        `/api/location/get-districts/${city_slug}`
      );
      setDistrictOptions(response.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setIsLoadingDistricts(false);
    }
  }

  async function fetchNeighborhoods(city_slug: string, district_slug: string) {
    setIsLoadingNeighborhoods(true);
    try {
      // Log the URL for debugging
      // console.log(
      //   `Fetching: /api/location/get-neighborhood/${city_slug}/${district_slug}`
      // );

      // Ensure both parameters are present and encoded
      if (!city_slug || !district_slug) {
        console.error("Missing parameters:", { city_slug, district_slug });
        return;
      }

      const response = await axios.get(
        `/api/location/get-neighborhood/${encodeURIComponent(
          city_slug
        )}/${encodeURIComponent(district_slug)}`
      );
      setNeighborhoodOptions(response.data);
    } catch (error) {
      console.error("Error fetching neighborhoods:", error);
      setNeighborhoodOptions([]); // Reset on error
    } finally {
      setIsLoadingNeighborhoods(false);
    }
  }

  // useEffect(() => {
  //   if (city) {
  //     const districtOptions =
  //       props.districts[city as keyof typeof props.districts];
  //     setDistrictOptions(
  //       Array.isArray(districtOptions)
  //         ? districtOptions.map((district) => district.district_name)
  //         : []
  //     );
  //     setDistrict("");
  //   }
  // }, [city, props.districts]);

  //console.log(getValues());
  const handleNext = async () => {
    if (
      await trigger([
        "location.streetAddress",
        "location.city",
        "location.state",
        "location.zip",
        "location.region",
        "location.country",
        "location.district",
        "location.neighborhood",
        "location.latitude",
        "location.longitude",
      ])
    )
      props.next();
  };

  const handleMapClick = (lat: number, lng: number) => {
    setValue("location.latitude", lat, { shouldDirty: true });
    setValue("location.longitude", lng, { shouldDirty: true });
    setMarkerPosition({ lat, lng });
  };

  // Initialize edit mode data from propertyLocation
  useEffect(() => {
    const initializeEditMode = async () => {
      if (props.isEdit && props.propertyLocation) {
        console.log(
          "Initializing edit mode with propertyLocation:",
          props.propertyLocation
        );

        try {
          // Set country and load cities
          if (props.propertyLocation.country) {
            const countryValue = props.propertyLocation.country;
            setCountry(countryValue);
            setValue("location.country", countryValue);
            setCityOptions(props.citiesObj[countryValue] || []);
          }

          // Set city and load districts
          if (props.propertyLocation.city) {
            const cityValue = props.propertyLocation.city;
            setCity(cityValue);
            setValue("location.city", cityValue);
            await fetchDistricts(cityValue);
          }

          // Set district and load neighborhoods
          if (props.propertyLocation.city && props.propertyLocation.district) {
            const districtValue = props.propertyLocation.district;
            setDistrict(districtValue);
            setValue("location.district", districtValue);
            await fetchNeighborhoods(
              props.propertyLocation.city,
              districtValue
            );
          }

          // Set neighborhood
          if (props.propertyLocation.neighborhood) {
            const neighborhoodValue = props.propertyLocation.neighborhood;
            setNeighborhood(neighborhoodValue);
            setValue("location.neighborhood", neighborhoodValue);
          }

          // Set coordinates
          if (
            props.propertyLocation.latitude &&
            props.propertyLocation.longitude
          ) {
            const lat = Number(props.propertyLocation.latitude);
            const lng = Number(props.propertyLocation.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              setMarkerPosition({ lat, lng });
              setValue("location.latitude", lat);
              setValue("location.longitude", lng);
            }
          }
        } catch (error) {
          console.error("Error initializing location data:", error);
        }
      }
    };

    initializeEditMode();
  }, [props.propertyLocation, props.citiesObj, props.isEdit, setValue]);

  // Initialize map position in edit mode
  useEffect(() => {
    if (props.isEdit && !markerPosition) {
      const values = getValues();
      const lat = Number(values.location?.latitude);
      const lng = Number(values.location?.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        setMarkerPosition({ lat, lng });
        setValue("location.latitude", lat);
        setValue("location.longitude", lng);
      }
    }
  }, [props.isEdit, markerPosition, getValues, setValue]);

  // Update cityOptions when country changes
  useEffect(() => {
    if (country) {
      setCityOptions(props.citiesObj[country] || []);
    }
  }, [country, props.citiesObj]);

  return (
    <Card className={cn("p-2  grid grid-cols-1  gap-3", props.className)}>
      <div className="flex lg:flex-row flex-col gap-4">
        <div className="w-full flex flex-col gap-y-4">
          <Select
            {...register("location.country")}
            onChange={handleCountryChange}
            label="Ülke"
            errorMessage={errors.location?.country?.message}
            isInvalid={!!errors.location?.country}
            value={country}
            selectedKeys={[watch("location.country") ?? country]}
          >
            {props.countries.map((item) => (
              <SelectItem key={item.country_name} value={item.country_name}>
                {item.country_name}
              </SelectItem>
            ))}
          </Select>

          <Select
            {...register("location.city")}
            onChange={handleCityChange}
            label="Şehir"
            errorMessage={errors.location?.city?.message}
            isInvalid={!!errors.location?.city}
            value={city}
            selectedKeys={[watch("location.city") ?? city]}
          >
            {cityOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </Select>

          <Select
            {...register("location.district")}
            onChange={handleDistrictChange}
            label="İlçe"
            errorMessage={errors.location?.district?.message}
            isInvalid={!!errors.location?.district}
            value={district}
            selectedKeys={[watch("location.district") ?? district]}
          >
            {districtOptions.map((c) => (
              <SelectItem key={c.label} value={c.label}>
                {c.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            {...register("location.neighborhood")}
            onChange={handleNeighborhoodChange}
            label="Mahalle"
            errorMessage={errors.location?.neighborhood?.message}
            isInvalid={!!errors.location?.neighborhood}
            value={neighborhood}
            selectedKeys={[watch("location.neighborhood") ?? neighborhood]}
          >
            {neighborhoodOptions.map((c) => (
              <SelectItem key={c.label} value={c.label}>
                {c.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            {...register("location.streetAddress")}
            errorMessage={errors.location?.streetAddress?.message}
            isInvalid={!!errors.location?.streetAddress}
            label="Adres Satırı"
            value={watch("location.streetAddress") || ""}
            onChange={(e) => setValue("location.streetAddress", e.target.value)}
          />

          <Input
            {...register("location.zip")}
            errorMessage={errors.location?.zip?.message}
            isInvalid={!!errors.location?.zip}
            label="Posta Kodu"
            value={watch("location.zip") || ""}
            onChange={(e) => setValue("location.zip", e.target.value)}
          />
          {/* <Input
          {...register("location.latitude", {
            valueAsNumber: true,
          })}
          errorMessage={errors.location?.latitude?.message}
          isInvalid={!!errors.location?.latitude}
          label="Enlem"
          {...(getValues().location && getValues().location.latitude
            ? {
                defaultValue: getValues().location?.latitude?.toString(),
              }
            : {})}
          // defaultValue={getValues().location.zip}
        />
        <Input
          {...register("location.longitude", {
            valueAsNumber: true,
          })}
          errorMessage={errors.location?.longitude?.message}
          isInvalid={!!errors.location?.longitude}
          label="Boylam"
          {...(getValues().location && getValues().location.longitude
            ? {
                defaultValue: getValues().location.longitude?.toString(),
              }
            : {})}
          // defaultValue={getValues().location.zip}
        /> */}
        </div>
        <div className="w-full flex flex-col gap-y-4 relative">
          {isLoadingCoordinates && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Spinner size="lg" />
            </div>
          )}
          <LocationPicker
            lat={Number(watch("location.latitude"))}
            lng={Number(watch("location.longitude"))}
            country={watch("location.country")}
            city={watch("location.city")}
            district={watch("location.district")}
            neighborhood={watch("location.neighborhood")}
            mode={props.isEdit ? "edit" : "add"}
            onMapClick={handleMapClick}
            markerPosition={markerPosition}
            setMarkerPosition={setMarkerPosition}
          />
        </div>
        {/* <Input
        {...register("location.state")}
        errorMessage={errors.location?.state?.message}
        isInvalid={!!errors.location?.state}
        label="State"
        {...(getValues().location && getValues().location.state
          ? {
              defaultValue: getValues().location.state,
            }
          : {})}
        // defaultValue={getValues().location.state}
      />

      <Input
        {...register("location.region")}
        errorMessage={errors.location?.region?.message}
        isInvalid={!!errors.location?.region}
        label="Region/Neighborhood"
        className="col-span-2"
        {...(getValues().location && getValues().location.neighborhood
          ? {
              defaultValue: getValues().location.region,
            }
          : {})}
        // defaultValue={getValues().location.region}
      />

      <Textarea
        {...register("location.landmark")}
        errorMessage={errors.location?.landmark?.message}
        isInvalid={!!errors.location?.landmark}
        label="Landmarks"
        className="col-span-2"
        {...(getValues().location && getValues().location.landmark
          ? {
              defaultValue: getValues().location.landmark,
            }
          : {})}
        // defaultValue={getValues().location.landmark}
      /> */}
      </div>
      <div className="flex justify-center col-span-2 gap-3 ">
        <Button
          onClick={props.prev}
          startContent={<ChevronLeftIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          Geri
        </Button>
        <Button
          onClick={handleNext}
          endContent={<ChevronRightIcon className="w-6" />}
          color="primary"
          className="w-36"
        >
          İleri
        </Button>
      </div>
    </Card>
  );
};
export default Location;
