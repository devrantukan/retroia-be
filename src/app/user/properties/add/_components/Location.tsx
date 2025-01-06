import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Textarea,
  cn,
} from "@nextui-org/react";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { AddPropertyInputType } from "./AddPropertyForm";
import { City, Country, District, Neighborhood } from "@prisma/client";
import { set } from "zod";
import LocationMap from "@/app/components/LocationPicker";
import LocationPicker from "@/app/components/LocationPicker";
import axios from "axios";

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
  } = useFormContext<AddPropertyInputType>();

  const [city, setCity] = React.useState(getValues().location?.city);
  const [country, setCountry] = React.useState(getValues().location?.country);
  const [district, setDistrict] = React.useState(
    getValues().location?.district
  );
  const [neighborhood, setNeighborhood] = React.useState(
    getValues().location?.neighborhood
  );

  const [cityOptions, setCityOptions] = React.useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = React.useState<any[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = React.useState<any[]>(
    []
  );

  const [latitude, setLatitude] = React.useState<number>(
    getValues().location?.latitude ?? 0
  );

  console.log(latitude);
  const [longitude, setLongitude] = React.useState<number>(
    getValues().location?.longitude ?? 0
  );
  // console.log("city ops", cityOptions);
  // console.log("city ops", neighborhoodOptions);
  async function findPlaces() {
    const { Place } = (await google.maps.importLibrary(
      "places"
    )) as google.maps.PlacesLibrary;
    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
      "marker"
    )) as google.maps.MarkerLibrary;
    const request = {
      textQuery: "Tacos in Mountain View",
      fields: ["displayName", "location", "businessStatus"],
      includedType: "restaurant",
      locationBias: { lat: 37.4161493, lng: -122.0812166 },
      isOpenNow: true,
      language: "en-US",
      maxResultCount: 8,
      minRating: 3.2,
      region: "us",
      useStrictTypeFiltering: false,
    };

    //@ts-ignore
    const { places } = await Place.searchByText(request);

    if (places.length) {
      console.log(places);

      const { LatLngBounds } = (await google.maps.importLibrary(
        "core"
      )) as google.maps.CoreLibrary;
      const bounds = new LatLngBounds();

      // Loop through and get all the results.
      places.forEach((place) => {
        console.log(place);
      });
    } else {
      console.log("No results");
    }
  }

  useEffect(() => {
    const values = getValues();
    if (values.location?.country) {
      setCountry(values.location?.country);
    }
    if (values.location?.city) {
      setCity(values.location?.city);
    }
  }, [getValues]);

  const handleNeighborhoodSelectionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setNeighborhood(e.target.value);
    setValue("location.neighborhood", e.target.value);

    try {
      // Construct the location string using selected values
      const locationString = `${neighborhood} ${district} ${city} ${country}`;

      const response = await axios.get(`/api/location/get-coordinates`, {
        params: {
          location: locationString,
        },
      });

      if (response.data.candidates && response.data.candidates[0]) {
        const location = response.data.candidates[0].geometry.location;
        setLatitude(location.lat);
        setLongitude(location.lng);

        // Also update the form values
        setValue("location.latitude", location.lat);
        setValue("location.longitude", location.lng);
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };
  const handleDistrictSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDistrict(e.target.value);
    setValue("location.district", e.target.value);
  };

  const handleCitySelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCity(e.target.value);
    setValue("location.city", e.target.value);
    setDistrict("");
    setValue("location.district", "");
    setNeighborhood("");
    setValue("location.neighborhood", "");
  };

  const handleCountrySelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCountry(e.target.value);
    setValue("location.country", e.target.value);
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
    if (district) {
      fetchNeighborhoods(district);
      setNeighborhood("");
    }
  }, [district]);

  async function fetchDistricts(city_slug: string) {
    try {
      const response = await axios.get(
        `/api/location/get-districts/${city_slug}`
      );
      setDistrictOptions(response.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  }

  async function fetchNeighborhoods(district_slug: string) {
    try {
      const response = await axios.get(
        `/api/location/get-neighborhood/${district_slug}`
      );
      setNeighborhoodOptions(response.data);
    } catch (error) {
      console.error("Error fetching neighborhoods:", error);
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
  return (
    <Card className={cn("p-2  grid grid-cols-1  gap-3", props.className)}>
      <div className="flex lg:flex-row flex-col gap-4">
        <div className="w-full flex flex-col gap-y-4">
          <Select
            {...register("location.country", {
              setValueAs: (v: any) => v.toString(),
            })}
            errorMessage={errors.location?.country?.message}
            isInvalid={!!errors.location?.country}
            label="Ülke"
            selectionMode="single"
            name="country"
            {...(getValues().location && getValues().location.country
              ? {
                  defaultSelectedKeys: [
                    getValues().location.country.toString(),
                  ],
                }
              : {})}
            value={country}
            onChange={handleCountrySelectionChange}
          >
            {props.countries.map((item) => (
              <SelectItem key={item.country_name} value={item.country_name}>
                {item.country_name}
              </SelectItem>
            ))}
          </Select>

          <Select
            {...register("location.city", {
              setValueAs: (v: any) => v.toString(),
            })}
            errorMessage={errors.location?.city?.message}
            isInvalid={!!errors.location?.city}
            label="Şehir"
            selectionMode="single"
            name="city"
            {...(getValues().location && getValues().location.city
              ? { defaultSelectedKeys: [getValues().location.city.toString()] }
              : {})}
            //   disabled={!country}
            value={city}
            onChange={handleCitySelectionChange}
          >
            {cityOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            {/* {cities
          .filter(
            (item: { country_id: number }) =>
              item.country_id === Number(country)
          )
          .map((item) => (
            <SelectItem key={item.city_id} value={item.city_id}>
              {item.city_name}
            </SelectItem>
          ))} */}
          </Select>

          <Select
            {...register("location.district", {
              setValueAs: (v: any) => v.toString(),
            })}
            errorMessage={errors.location?.district?.message}
            isInvalid={!!errors.location?.district}
            label="İlçe"
            selectionMode="single"
            name="district"
            {...(getValues().location && getValues().location.district
              ? {
                  defaultSelectedKeys: [
                    getValues().location.district.toString(),
                  ],
                }
              : {})}
            value={district}
            onChange={handleDistrictSelectionChange}
            //   disabled={!city}
          >
            {districtOptions.map((c) => (
              <SelectItem key={c.label} value={c.label}>
                {c.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            {...register("location.neighborhood", {
              setValueAs: (v: any) => v.toString(),
            })}
            errorMessage={errors.location?.neighborhood?.message}
            isInvalid={!!errors.location?.neighborhood}
            label="Mahalle"
            selectionMode="single"
            name="neighborhood"
            //    disabled={!district}
            {...(getValues().location && getValues().location.neighborhood
              ? {
                  defaultSelectedKeys: [
                    getValues().location.neighborhood.toString(),
                  ],
                }
              : {})}
            value={neighborhood}
            onChange={handleNeighborhoodSelectionChange}
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
            name="location.streetAddress"
            {...(getValues().location && getValues().location.streetAddress
              ? {
                  defaultValue: getValues().location.streetAddress,
                }
              : {})}
            // defaultValue={getValues().location.streetAddress}
          />

          <Input
            {...register("location.zip")}
            errorMessage={errors.location?.zip?.message}
            isInvalid={!!errors.location?.zip}
            label="Posta Kodu"
            {...(getValues().location && getValues().location.zip
              ? {
                  defaultValue: getValues().location.zip,
                }
              : {})}
            // defaultValue={getValues().location.zip}
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
        <div className="w-full flex flex-col gap-y-4">
          <LocationPicker lat={latitude} lng={longitude} />
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
