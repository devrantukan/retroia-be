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

interface Props {
  next: () => void;
  prev: () => void;
  className?: string;
  countries: Country[];
  cities: City[];
  districts: District[];
  citiesObj: Record<any, any[]>; // Add this line
  districtsObj: Record<any, any[]>;
  neighborhoods: Neighborhood[];
  neighborhoodsObj: Record<any, any[]>;
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

  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");

  const [cityOptions, setCityOptions] = React.useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = React.useState<string[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = React.useState<
    string[]
  >([]);

  //console.log("dist is", district);

  const handleNeighborhoodSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setNeighborhood(e.target.value);
    setValue("location.neighborhood", e.target.value);
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
      setDistrictOptions(props.districtsObj[city] || []);
      setDistrict("");
      setNeighborhood("");
    }
  }, [city, props.districtsObj]);

  useEffect(() => {
    if (district) {
      setNeighborhoodOptions(props.neighborhoodsObj[district] || []);
      setNeighborhood("");
    }
  }, [district, props.neighborhoodsObj]);

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
      ])
    )
      props.next();
  };
  return (
    <Card
      className={cn(
        "p-2  grid grid-cols-1 md:grid-cols-2 gap-3",
        props.className
      )}
    >
      {/* <Input
        {...register("location.city")}
        errorMessage={errors.location?.city?.message}
        isInvalid={!!errors.location?.city}
        label="City"
        {...(getValues().location && getValues().location.city
          ? {
              defaultValue: getValues().location.city,
            }
          : {})}
        // defaultValue={getValues().location.city}
      />

      <Input
        {...register("location.district")}
        errorMessage={errors.location?.district?.message}
        isInvalid={!!errors.location?.district}
        label="District"
        {...(getValues().location && getValues().location.district
          ? {
              defaultValue: getValues().location.district,
            }
          : {})}

        // defaultValue={getValues().location.city}
      />

      <Input
        {...register("location.neighborhood")}
        errorMessage={errors.location?.neighborhood?.message}
        isInvalid={!!errors.location?.neighborhood}
        label="Neighborhood"
        {...(getValues().location && getValues().location.neighborhood
          ? {
              defaultValue: getValues().location.neighborhood,
            }
          : {})}
        // defaultValue={getValues().location.city}
      /> */}
      {/* <Input
        {...register("location.country")}
        errorMessage={errors.location?.country?.message}
        isInvalid={!!errors.location?.country}
        label="Country"
        {...(getValues().location && getValues().location.country
          ? {
              defaultValue: getValues().location.country,
            }
          : {})}
        // defaultValue={getValues().location.city}
      /> */}

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
          ? { defaultSelectedKeys: [getValues().location.country.toString()] }
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
          ? { defaultSelectedKeys: [getValues().location.district.toString()] }
          : {})}
        value={district}
        onChange={handleDistrictSelectionChange}
        //   disabled={!city}
      >
        {districtOptions.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
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
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </Select>

      <Input
        {...register("location.streetAddress")}
        errorMessage={errors.location?.streetAddress?.message}
        isInvalid={!!errors.location?.streetAddress}
        label="Street Address"
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
        label="Zip/Postal Code"
        {...(getValues().location && getValues().location.zip
          ? {
              defaultValue: getValues().location.zip,
            }
          : {})}
        // defaultValue={getValues().location.zip}
      />

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
      <div className="flex justify-center col-span-2 gap-3">
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
