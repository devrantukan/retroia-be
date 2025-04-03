"use client";

import {
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
  Spinner,
} from "@nextui-org/react";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createProject, updateProject } from "@/app/actions/project";
import { projectSchema } from "@/lib/validations/project";
import ProjectImagesUploader from "./ProjectImagesUploader";
import slugify from "slugify";
import LocationPicker from "@/app/components/LocationPicker";
import axios from "axios";

type Props = {
  project?: Prisma.ProjectGetPayload<{
    include: {
      location: true;
      unitSizes: true;
      socialFeatures: true;
      images: true;
    };
  }>;
  offices: { id: number; name: string }[];
  agents?: { id: number; name: string; surname: string; officeId: number }[];
  countries: { country_name: string }[];
  cities: { city_name: string }[];
  citiesObj: Record<string, string[]>;
};

const ProjectForm = ({
  project,
  offices,
  agents = [],
  countries,
  cities,
  citiesObj,
}: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<any[]>([]);
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    officeId: project?.officeId || "",
    assignedAgents: project?.assignedAgents || "",
    publishingStatus: project?.publishingStatus || "DRAFT",
    startDate: project?.startDate
      ? new Date(project.startDate).toISOString().split("T")[0]
      : "",
    endDate: project?.endDate
      ? new Date(project.endDate).toISOString().split("T")[0]
      : "",
    deedInfo: project?.deedInfo || "",
    landArea: project?.landArea || "",
    nOfUnits: project?.nOfUnits || "",
    slug: project?.slug || "",
    location: {
      streetAddress: project?.location?.streetAddress || "",
      city: project?.location?.city || "",
      state: project?.location?.state || "",
      zip: project?.location?.zip || "",
      country: project?.location?.country || "",
      landmark: project?.location?.landmark || "",
      district: project?.location?.district || "",
      neighborhood: project?.location?.neighborhood || "",
      latitude: (project?.location as any)?.latitude || 0,
      longitude: (project?.location as any)?.longitude || 0,
    },
    unitSizes: project?.unitSizes || [{ value: "" }],
    socialFeatures: project?.socialFeatures || [{ value: "" }],
    images: project?.images || [{ url: "" }],
  });

  // Initialize location data from project
  useEffect(() => {
    if (project?.location) {
      setCountry(project.location.country);
      setCity(project.location.city);
      setDistrict(project.location.district);
      setNeighborhood(project.location.neighborhood);
      if (
        (project.location as any).latitude &&
        (project.location as any).longitude
      ) {
        setMarkerPosition({
          lat: (project.location as any).latitude,
          lng: (project.location as any).longitude,
        });
      }
    }
  }, [project]);

  // Update city options when country changes
  useEffect(() => {
    if (country) {
      setCityOptions(citiesObj[country] || []);
      setCity("");
      setDistrict("");
      setNeighborhood("");
    }
  }, [country, citiesObj]);

  // Fetch districts when city changes
  useEffect(() => {
    if (city) {
      fetchDistricts(city);
      setDistrict("");
      setNeighborhood("");
    }
  }, [city]);

  // Fetch neighborhoods when district changes
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
      const response = await axios.get(
        `/api/location/get-neighborhood/${encodeURIComponent(
          city_slug
        )}/${encodeURIComponent(district_slug)}`
      );
      setNeighborhoodOptions(response.data);
    } catch (error) {
      console.error("Error fetching neighborhoods:", error);
      setNeighborhoodOptions([]);
    } finally {
      setIsLoadingNeighborhoods(false);
    }
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, country: selectedCountry },
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, city: selectedCity },
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value;
    setDistrict(selectedDistrict);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, district: selectedDistrict },
    }));
  };

  const handleNeighborhoodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedNeighborhood = e.target.value;
    setNeighborhood(selectedNeighborhood);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, neighborhood: selectedNeighborhood },
    }));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Transform the data to match the schema
      const transformedData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        officeId: Number(formData.officeId),
        publishingStatus: formData.publishingStatus as
          | "DRAFT"
          | "PUBLISHED"
          | "ARCHIVED",
        slug: project
          ? formData.slug
          : slugify(formData.name, { lower: true, strict: true }),
      };

      console.log("Transformed data:", transformedData); // Add this for debugging

      const validatedData = projectSchema.parse(transformedData);
      const result = project
        ? await updateProject(project.id, validatedData)
        : await createProject(validatedData);

      if (result.success) {
        toast.success(
          project
            ? "Proje başarıyla güncellendi"
            : "Proje başarıyla oluşturuldu"
        );
        router.push("/admin/projects");
      } else {
        toast.error(result.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof Error) {
        toast.error(`Doğrulama hatası: ${error.message}`);
      } else {
        toast.error("Lütfen tüm alanları doğru şekilde doldurun");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = (field: "unitSizes" | "socialFeatures" | "images") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { value: "" }],
    }));
  };

  const handleRemoveItem = (
    field: "unitSizes" | "socialFeatures" | "images",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    field: "unitSizes" | "socialFeatures" | "images",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, value } : item
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Proje Adı"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />

        <Select
          label="Ofis"
          value={formData.officeId.toString()}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              officeId: Number(e.target.value),
              assignedAgents: "",
            }))
          }
          required
        >
          {offices.map((office) => (
            <SelectItem key={office.id} value={office.id.toString()}>
              {office.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Atanmış Danışmanlar"
          selectedKeys={
            formData.assignedAgents
              ? new Set(formData.assignedAgents.split(",").filter(Boolean))
              : new Set()
          }
          onSelectionChange={(keys) => {
            const selectedIds = Array.from(keys).filter(Boolean);
            setFormData((prev) => ({
              ...prev,
              assignedAgents:
                selectedIds.length > 0 ? selectedIds.join(",") : "",
            }));
          }}
          selectionMode="multiple"
          required
          isDisabled={!formData.officeId}
        >
          {agents
            ?.filter((agent) => agent.officeId === Number(formData.officeId))
            .map((agent) => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.name} {agent.surname}
              </SelectItem>
            ))}
        </Select>

        <Input
          label="Başlangıç Tarihi"
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, startDate: e.target.value }))
          }
          required
        />

        <Input
          label="Teslim Tarihi"
          type="date"
          value={formData.endDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, endDate: e.target.value }))
          }
          required
        />

        <Input
          label="Tapu Bilgisi"
          value={formData.deedInfo}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, deedInfo: e.target.value }))
          }
          required
        />

        <Input
          label="Arsa Alanı"
          value={formData.landArea}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, landArea: e.target.value }))
          }
          required
        />

        <Input
          label="Konut Adeti"
          value={formData.nOfUnits}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nOfUnits: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Konum Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full flex flex-col gap-y-4">
            <Select
              label="Ülke"
              value={country}
              onChange={handleCountryChange}
              required
            >
              {countries.map((item) => (
                <SelectItem key={item.country_name} value={item.country_name}>
                  {item.country_name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Şehir"
              value={city}
              onChange={handleCityChange}
              required
              isLoading={isLoadingDistricts}
            >
              {cityOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="İlçe"
              value={district}
              onChange={handleDistrictChange}
              required
              isLoading={isLoadingNeighborhoods}
            >
              {districtOptions.map((c) => (
                <SelectItem key={c.label} value={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Mahalle"
              value={neighborhood}
              onChange={handleNeighborhoodChange}
              required
            >
              {neighborhoodOptions.map((c) => (
                <SelectItem key={c.label} value={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Adres"
              value={formData.location.streetAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: { ...prev.location, streetAddress: e.target.value },
                }))
              }
              required
            />

            <Input
              label="Posta Kodu"
              value={formData.location.zip}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: { ...prev.location, zip: e.target.value },
                }))
              }
              required
            />
          </div>

          <div className="w-full flex flex-col gap-y-4 relative">
            {isLoadingCoordinates && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Spinner size="lg" />
              </div>
            )}
            <LocationPicker
              lat={formData.location.latitude}
              lng={formData.location.longitude}
              country={formData.location.country}
              city={formData.location.city}
              district={formData.location.district}
              neighborhood={formData.location.neighborhood}
              mode={project ? "edit" : "add"}
              onMapClick={handleMapClick}
              markerPosition={markerPosition}
              setMarkerPosition={setMarkerPosition}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Konut Büyüklükleri</h3>
          <Button
            type="button"
            color="primary"
            variant="flat"
            onClick={() => handleAddItem("unitSizes")}
          >
            Ekle
          </Button>
        </div>
        {formData.unitSizes.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item.value}
              onChange={(e) =>
                handleItemChange("unitSizes", index, e.target.value)
              }
              placeholder="Birim büyüklüğü"
              required
            />
            <Button
              type="button"
              color="danger"
              variant="flat"
              onClick={() => handleRemoveItem("unitSizes", index)}
            >
              Sil
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sosyal Özellikler</h3>
          <Button
            type="button"
            color="primary"
            variant="flat"
            onClick={() => handleAddItem("socialFeatures")}
          >
            Ekle
          </Button>
        </div>
        {formData.socialFeatures.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item.value}
              onChange={(e) =>
                handleItemChange("socialFeatures", index, e.target.value)
              }
              placeholder="Sosyal özellik"
              required
            />
            <Button
              type="button"
              color="danger"
              variant="flat"
              onClick={() => handleRemoveItem("socialFeatures", index)}
            >
              Sil
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Görseller</h3>
        <ProjectImagesUploader
          currentImages={formData.images.map((img) => img.url)}
          onImagesUpload={(urls) =>
            setFormData((prev) => ({
              ...prev,
              images: urls.map((url) => ({ url })),
            }))
          }
          projectName={formData.name}
        />
      </div>

      <Textarea
        label="Açıklama"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        required
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="flat"
          onClick={() => router.push("/admin/projects")}
        >
          İptal
        </Button>
        <Button type="submit" color="primary" isLoading={isLoading}>
          {project ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
