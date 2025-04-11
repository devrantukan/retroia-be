"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  CountrySchema,
  CitySchema,
  DistrictSchema,
  NeighborhoodSchema,
} from "@/lib/validations/location";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  item: any;
  onSuccess: () => void;
  countries: any[];
  cities: any[];
  districts: any[];
};

export default function LocationModal({
  isOpen,
  onClose,
  type,
  item,
  onSuccess,
  countries,
  cities,
  districts,
}: Props) {
  const schema =
    {
      countries: CountrySchema,
      cities: CitySchema,
      districts: DistrictSchema,
      neighborhoods: NeighborhoodSchema,
    }[type] || CountrySchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const [formData, setFormData] = useState({
    country_name: "",
    city_name: "",
    district_name: "",
    neighborhood_name: "",
    country_id: "",
    city_id: "",
    district_id: "",
    slug: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        country_name: item.country_name || "",
        city_name: item.city_name || "",
        district_name: item.district_name || "",
        neighborhood_name: item.neighborhood_name || "",
        country_id: item.country_id?.toString() || "",
        city_id: item.city_id?.toString() || "",
        district_id: item.district_id?.toString() || "",
        slug: item.slug || "",
      });
    } else {
      resetForm();
    }
  }, [item]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert IDs to numbers
      const payload = {
        ...formData,
        ...(type === "cities" && { country_id: parseInt(formData.country_id) }),
        ...(type === "districts" && { city_id: parseInt(formData.city_id) }),
        ...(type === "neighborhoods" && {
          district_id: parseInt(formData.district_id),
        }),
      };

      const response = await fetch(`/api/locations/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Kayıt başarıyla eklendi");
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      country_name: "",
      city_name: "",
      district_name: "",
      neighborhood_name: "",
      country_id: "",
      city_id: "",
      district_id: "",
      slug: "",
    });
  };

  const getTitle = () => {
    const action = item ? "Düzenle" : "Ekle";
    const entity = {
      countries: "Ülke",
      cities: "Şehir",
      districts: "İlçe",
      neighborhoods: "Mahalle",
    }[type];
    return `${entity} ${action}`;
  };

  const renderFields = () => {
    switch (type) {
      case "cities":
        return (
          <>
            <Input
              label="Şehir Adı"
              value={formData.city_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, city_name: e.target.value })
              }
              required
            />
            <Select
              label="Ülke"
              selectedKeys={
                formData.country_id ? [formData.country_id.toString()] : []
              }
              onChange={(e) =>
                setFormData({ ...formData, country_id: e.target.value })
              }
              required
            >
              {countries.map((country) => (
                <SelectItem key={country.country_id} value={country.country_id}>
                  {country.country_name}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Slug"
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
          </>
        );
      case "countries":
        return (
          <>
            <Input
              label="Ülke Adı"
              value={formData.country_name}
              onChange={(e) =>
                setFormData({ ...formData, country_name: e.target.value })
              }
              isRequired
              errorMessage={errors.country_name?.message?.toString()}
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              isRequired
              errorMessage={errors.slug?.message?.toString()}
            />
          </>
        );
      case "districts":
        return (
          <>
            <Input
              label="İlçe Adı"
              value={formData.district_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, district_name: e.target.value })
              }
              required
            />
            <Select
              label="Şehir"
              selectedKeys={
                formData.city_id ? [formData.city_id.toString()] : []
              }
              defaultSelectedKeys={
                formData.city_id ? [formData.city_id.toString()] : []
              }
              onChange={(e) =>
                setFormData({ ...formData, city_id: e.target.value })
              }
              value={formData.city_id?.toString()}
              isRequired
              scrollShadowProps={{
                isEnabled: true,
                hideScrollBar: false,
                offset: 15,
              }}
              className="max-h-[200px]"
            >
              {(Array.isArray(cities) ? cities : []).map((city) => (
                <SelectItem
                  key={city.city_id.toString()}
                  value={city.city_id.toString()}
                >
                  {city.city_name}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Slug"
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
          </>
        );
      case "neighborhoods":
        return (
          <>
            <Input
              label="Mahalle Adı"
              value={formData.neighborhood_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, neighborhood_name: e.target.value })
              }
              required
            />
            <Select
              label="İlçe"
              selectedKeys={
                formData.district_id ? [formData.district_id.toString()] : []
              }
              onChange={(e) =>
                setFormData({ ...formData, district_id: e.target.value })
              }
              required
            >
              {districts.map((district) => (
                <SelectItem
                  key={district.district_id}
                  value={district.district_id}
                >
                  {district.district_name}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Slug"
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>{getTitle()}</ModalHeader>
          <ModalBody>{renderFields()}</ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              İptal
            </Button>
            <Button color="primary" type="submit" isLoading={isLoading}>
              Kaydet
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
