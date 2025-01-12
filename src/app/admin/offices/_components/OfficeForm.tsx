"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OfficeFormSchema } from "@/lib/zodSchema";
import { Input, Button, Textarea, Select, SelectItem } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ImageUploader from "@/app/admin/offices/_components/ImageUploader";
import { saveOffice, updateOffice } from "@/lib/actions/office";
import slugify from "slugify";

interface OfficeFormProps {
  mode: "add" | "edit";
  office?: any;
}

export default function OfficeForm({ mode, office }: OfficeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(office?.avatarUrl || "");
  const [locationData, setLocationData] = useState<any>({
    countries: [],
    cities: [],
    districts: [],
    neighborhoods: [],
  });
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<
    Array<{ neighborhood_id: number; name: string }>
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(OfficeFormSchema),
    defaultValues:
      mode === "edit"
        ? {
            name: office?.name || "",
            email: office?.email || "",
            phone: office?.phone || "",
            fax: office?.fax || "",
            description: office?.description || "",
            streetAddress: office?.streetAddress || "",
            zip: office?.zip || "",
            countryId: office?.countryId || "",
            cityId: office?.cityId || "",
            districtId: office?.districtId || "",
            neighborhoodId: office?.neighborhoodId || "",
            webUrl: office?.webUrl || "",
            xAccountId: office?.xAccountId || "",
            facebookAccountId: office?.facebookAccountId || "",
            linkedInAccountId: office?.linkedInAccountId || "",
            instagramAccountId: office?.instagramAccountId || "",
            youtubeAccountId: office?.youtubeAccountId || "",
            latitude: office?.latitude || 0,
            longitude: office?.longitude || 0,
          }
        : {},
  });

  useEffect(() => {
    if (mode === "edit" && office) {
      Object.entries(office).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, [mode, office, setValue]);

  const countryId = watch("countryId");
  const cityId = watch("cityId");
  const districtId = watch("districtId");
  const neighborhoodId = watch("neighborhoodId");

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/data/countries");
        const data = await res.json();
        setLocationData((prev: { countries: any[] }) => ({
          ...prev,
          countries: data,
        }));
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);
  console.log("cloc", locationData.countries);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (countryId) {
        try {
          const res = await fetch(`/api/data/cities/${countryId}`);
          const data = await res.json();
          setLocationData((prev: { cities: any[] }) => ({
            ...prev,
            cities: data,
          }));
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      }
    };
    fetchCities();
  }, [countryId]);

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (cityId) {
        try {
          const res = await fetch(`/api/data/districts/${cityId}`);
          const data = await res.json();
          setLocationData((prev: { districts: any[] }) => ({
            ...prev,
            districts: data,
          }));
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };
    fetchDistricts();
  }, [cityId]);

  // Fetch neighborhoods when district changes
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (districtId) {
        try {
          const res = await fetch(
            `/api/data/neighborhoods/${cityId}/${districtId}`
          );
          const data = await res.json();
          setLocationData((prev: { neighborhoods: any[] }) => ({
            ...prev,
            neighborhoods: data,
          }));
        } catch (error) {
          console.error("Error fetching neighborhoods:", error);
        }
      }
    };
    fetchNeighborhoods();
  }, [districtId, cityId]);

  useEffect(() => {
    if (countryId) {
      setFilteredCities(
        locationData.cities.filter(
          (city: { country_id: number }) =>
            city.country_id === Number(countryId)
        )
      );
    }
  }, [countryId, locationData.cities]);

  useEffect(() => {
    if (cityId) {
      setFilteredDistricts(
        locationData.districts.filter(
          (district: { city_id: number }) => district.city_id === Number(cityId)
        )
      );
    }
  }, [cityId, locationData.districts]);

  useEffect(() => {
    if (districtId) {
      setFilteredNeighborhoods(
        locationData.neighborhoods.filter(
          (neighborhood: { district_id: number }) =>
            neighborhood.district_id === Number(districtId)
        )
      );
    }
  }, [districtId, locationData.neighborhoods]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const slug = slugify(data.name, { lower: true, strict: true });

      if (mode === "add") {
        await saveOffice({ ...data, slug });
        toast.success("Ofis başarıyla eklendi!");
      } else {
        await updateOffice(office.id, { ...data, slug });
        toast.success("Ofis başarıyla güncellendi!");
      }
      router.push("/admin/offices");
      router.refresh();
    } catch (error) {
      toast.error("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("name")}
          label="Ofis Adı"
          errorMessage={errors.name?.message as string}
          isInvalid={!!errors.name}
          value={watch("name")}
        />

        <ImageUploader
          currentImage={avatarUrl}
          onImageUpload={setAvatarUrl}
          label="Ofis Logosu"
        />

        <Input
          {...register("email")}
          label="E-posta"
          errorMessage={errors.email?.message as string}
          isInvalid={!!errors.email}
          value={watch("email")}
        />

        <Input
          {...register("phone")}
          label="Telefon"
          errorMessage={errors.phone?.message as string}
          isInvalid={!!errors.phone}
          value={watch("phone")}
        />

        <Input
          {...register("fax")}
          label="Faks"
          errorMessage={errors.fax?.message as string}
          isInvalid={!!errors.fax}
          value={watch("fax")}
        />

        <Input
          {...register("webUrl")}
          label="Web Sitesi"
          errorMessage={errors.webUrl?.message as string}
          isInvalid={!!errors.webUrl}
          value={watch("webUrl")}
        />

        <Select
          label="Ülke"
          selectedKeys={countryId ? [countryId.toString()] : []}
          onChange={(e) => setValue("countryId", Number(e.target.value))}
          items={locationData.countries || []}
        >
          {(country: { country_id: number; country_name: string }) => (
            <SelectItem key={country.country_id} value={country.country_id}>
              {country.country_name}
            </SelectItem>
          )}
        </Select>

        <Select
          label="Şehir"
          selectedKeys={cityId ? [cityId.toString()] : []}
          onChange={(e) => setValue("cityId", Number(e.target.value))}
          items={locationData.cities || []}
        >
          {(city: { city_id: number; city_name: string }) => (
            <SelectItem key={city.city_id} value={city.city_id}>
              {city.city_name}
            </SelectItem>
          )}
        </Select>

        <Select
          label="İlçe"
          selectedKeys={districtId ? [districtId.toString()] : []}
          onChange={(e) => setValue("districtId", Number(e.target.value))}
          items={locationData.districts || []}
        >
          {(district: { district_id: number; district_name: string }) => (
            <SelectItem key={district.district_id} value={district.district_id}>
              {district.district_name}
            </SelectItem>
          )}
        </Select>

        <Select
          label="Mahalle"
          selectedKeys={neighborhoodId ? [neighborhoodId.toString()] : []}
          onChange={(e) => setValue("neighborhoodId", Number(e.target.value))}
          items={locationData.neighborhoods || []}
        >
          {(neighborhood: {
            neighborhood_id: number;
            neighborhood_name: string;
          }) => (
            <SelectItem
              key={neighborhood.neighborhood_id}
              value={neighborhood.neighborhood_id}
            >
              {neighborhood.neighborhood_name}
            </SelectItem>
          )}
        </Select>

        <Input
          {...register("streetAddress")}
          label="Adres"
          errorMessage={errors.streetAddress?.message as string}
          isInvalid={!!errors.streetAddress}
          value={watch("streetAddress")}
        />

        <Input
          {...register("zip")}
          label="Posta Kodu"
          errorMessage={errors.zip?.message as string}
          isInvalid={!!errors.zip}
          value={watch("zip")}
        />
      </div>

      <Textarea
        {...register("description")}
        label="Açıklama"
        errorMessage={errors.description?.message as string}
        isInvalid={!!errors.description}
        value={watch("description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("xAccountId")}
          label="X (Twitter) Hesabı"
          value={watch("xAccountId")}
        />

        <Input
          {...register("facebookAccountId")}
          label="Facebook Hesabı"
          value={watch("facebookAccountId")}
        />

        <Input
          {...register("linkedInAccountId")}
          label="LinkedIn Hesabı"
          value={watch("linkedInAccountId")}
        />

        <Input
          {...register("instagramAccountId")}
          label="Instagram Hesabı"
          value={watch("instagramAccountId")}
        />

        <Input
          {...register("youtubeAccountId")}
          label="YouTube Hesabı"
          value={watch("youtubeAccountId")}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          color="danger"
          variant="light"
          onClick={() => router.push("/admin/offices")}
        >
          İptal
        </Button>
        <Button color="primary" type="submit" isLoading={loading}>
          {mode === "add" ? "Ekle" : "Güncelle"}
        </Button>
      </div>
    </form>
  );
}
