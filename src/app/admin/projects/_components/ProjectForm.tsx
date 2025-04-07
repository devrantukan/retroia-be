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

type FormData = {
  name: string;
  description: string;
  officeId: string;
  assignedAgents: string;
  publishingStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  startDate: string;
  endDate: string;
  deedInfo: string;
  landArea: string;
  nOfUnits: string;
  slug: string;
  location: {
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    landmark: string;
    district: string;
    neighborhood: string;
    latitude: number;
    longitude: number;
  };
  unitSizes: { value: string }[];
  socialFeatures: { value: string }[];
  images: { url: string }[];
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
  const [selectedAgentNames, setSelectedAgentNames] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: project?.name || "",
    description: project?.description || "",
    officeId: project?.officeId ? project.officeId.toString() : "",
    assignedAgents: project?.assignedAgents || "",
    publishingStatus: "DRAFT",
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
    images: project?.images.map((img) => ({ url: img.url })) || [],
  });

  // Initialize form data and location when project changes
  useEffect(() => {
    if (project) {
      console.log("Project assigned agents:", project.assignedAgents);

      const newFormData: FormData = {
        name: project.name || "",
        description: project.description || "",
        officeId: project.officeId ? project.officeId.toString() : "",
        assignedAgents: project.assignedAgents || "",
        publishingStatus: project.publishingStatus as
          | "DRAFT"
          | "PUBLISHED"
          | "ARCHIVED",
        startDate: project.startDate
          ? new Date(project.startDate).toISOString().split("T")[0]
          : "",
        endDate: project.endDate
          ? new Date(project.endDate).toISOString().split("T")[0]
          : "",
        deedInfo: project.deedInfo || "",
        landArea: project.landArea || "",
        nOfUnits: project.nOfUnits || "",
        slug: project.slug || "",
        location: {
          streetAddress: project.location?.streetAddress || "",
          city: project.location?.city || "",
          state: project.location?.state || "",
          zip: project.location?.zip || "",
          country: project.location?.country || "",
          landmark: project.location?.landmark || "",
          district: project.location?.district || "",
          neighborhood: project.location?.neighborhood || "",
          latitude: (project.location as any)?.latitude || 0,
          longitude: (project.location as any)?.longitude || 0,
        },
        unitSizes: project.unitSizes || [{ value: "" }],
        socialFeatures: project.socialFeatures || [{ value: "" }],
        images: project.images.map((img) => ({ url: img.url })) || [],
      };

      setFormData(newFormData);

      // Set location states and fetch related data
      if (project.location) {
        const { country, city, district, neighborhood } = project.location;

        // Set location states first
        if (country) {
          setCountry(country);
          // Update city options based on country
          setCityOptions(citiesObj[country] || []);
        }

        if (city) {
          setCity(city);
          // Fetch districts for the city
          fetchDistricts(city);
        }

        if (district) {
          setDistrict(district);
          // Fetch neighborhoods for the district
          if (city) {
            fetchNeighborhoods(city, district);
          }
        }

        if (neighborhood) {
          setNeighborhood(neighborhood);
        }

        // Set marker position if coordinates exist
        if (
          (project.location as any)?.latitude &&
          (project.location as any)?.longitude
        ) {
          const lat = (project.location as any).latitude;
          const lng = (project.location as any).longitude;
          setMarkerPosition({ lat, lng });
          // Also update form data with coordinates
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: lat,
              longitude: lng,
            },
          }));
        }
      }
    }
  }, [project, citiesObj]);

  // Update city options when country changes
  useEffect(() => {
    if (country) {
      setCityOptions(citiesObj[country] || []);
      if (!project) {
        setCity("");
        setDistrict("");
        setNeighborhood("");
      }
    }
  }, [country, citiesObj, project]);

  // Fetch districts when city changes
  useEffect(() => {
    if (city) {
      fetchDistricts(city);
      if (!project) {
        setDistrict("");
        setNeighborhood("");
      }
    }
  }, [city, project]);

  // Fetch neighborhoods when district changes
  useEffect(() => {
    if (district && city) {
      fetchNeighborhoods(city, district);
      if (!project) {
        setNeighborhood("");
      }
    }
  }, [district, city, project]);

  // Update selected agent names when assigned agents change
  useEffect(() => {
    if (formData.assignedAgents && agents) {
      const agentIds = formData.assignedAgents.split(",").filter(Boolean);
      const names = agentIds
        .map((id) => {
          const agent = agents.find((a) => a.id.toString() === id);
          return agent ? `${agent.name} ${agent.surname}` : "";
        })
        .filter(Boolean);
      setSelectedAgentNames(names);
    } else {
      setSelectedAgentNames([]);
    }
  }, [formData.assignedAgents, agents]);

  useEffect(() => {
    console.log("Project data:", project);
    console.log("Office ID from project:", project?.officeId);
    console.log("Form data office ID:", formData.officeId);
    console.log("Offices list:", offices);

    // Check if the office exists in the offices list
    if (project?.officeId) {
      const officeExists = offices.some(
        (office) => office.id === project.officeId
      );
      console.log("Office exists in list:", officeExists);
    }
  }, [project, formData.officeId, offices]);

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
    // Reset other location fields
    setCity("");
    setDistrict("");
    setNeighborhood("");
    setCityOptions([]);
    setDistrictOptions([]);
    setNeighborhoodOptions([]);
    // Update city options based on the selected country
    if (selectedCountry) {
      setCityOptions(citiesObj[selectedCountry] || []);
    }
    // Reset marker position when country changes
    setMarkerPosition(null);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, city: selectedCity },
    }));
    // Reset dependent fields
    setDistrict("");
    setNeighborhood("");
    setDistrictOptions([]);
    setNeighborhoodOptions([]);
    // Fetch districts for the selected city
    if (selectedCity) {
      fetchDistricts(selectedCity);
      // Fetch coordinates for the city
      fetchCoordinates(selectedCity, "", "", "");
    }
    // Reset marker position when city changes
    setMarkerPosition(null);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value;
    setDistrict(selectedDistrict);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        district: selectedDistrict,
        state: selectedDistrict,
      },
    }));
    // Reset dependent field
    setNeighborhood("");
    setNeighborhoodOptions([]);
    // Fetch neighborhoods for the selected district
    if (selectedDistrict && city) {
      fetchNeighborhoods(city, selectedDistrict);
      // Fetch coordinates for the district
      fetchCoordinates(city, selectedDistrict, "", "");
    }
    // Reset marker position when district changes
    setMarkerPosition(null);
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
    // Fetch coordinates for the neighborhood
    if (selectedNeighborhood && city && district) {
      fetchCoordinates(city, district, selectedNeighborhood, "");
    }
    // Reset marker position when neighborhood changes
    setMarkerPosition(null);
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
        officeId: formData.officeId ? Number(formData.officeId) : 0,
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

  const fetchCoordinates = async (
    city: string,
    district: string,
    neighborhood: string,
    address: string
  ) => {
    setIsLoadingCoordinates(true);
    try {
      // Try different address formats
      const addressFormats: string[] = [];

      // Add full address with neighborhood if available
      if (neighborhood) {
        addressFormats.push(
          `${neighborhood}, ${district} İlçesi, ${city} İli, Türkiye`
        );
      }

      // Add other address formats
      addressFormats.push(
        `${district} İlçesi, ${city} İli, Türkiye`,
        `${city} İli, ${district} İlçesi, Türkiye`,
        `${district} İlçesi, Türkiye`,
        `${city} İli, Türkiye`
      );

      let coordinatesFound = false;

      for (const addressString of addressFormats) {
        const response = await axios.get(
          `/api/location/get-coordinates?location=${encodeURIComponent(
            addressString
          )}&region=tr`
        );

        if (response.data.candidates && response.data.candidates.length > 0) {
          const { lat, lng } = response.data.candidates[0].geometry.location;
          setMarkerPosition({ lat, lng });
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: lat,
              longitude: lng,
            },
          }));
          coordinatesFound = true;
          break;
        }
      }

      if (!coordinatesFound) {
        console.warn("No coordinates found for any address format:", {
          city,
          district,
          neighborhood,
          triedFormats: addressFormats,
        });
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    } finally {
      setIsLoadingCoordinates(false);
    }
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
          selectedKeys={formData.officeId ? [formData.officeId] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]?.toString() || "";
            setFormData((prev) => ({
              ...prev,
              officeId: selectedKey,
              assignedAgents: "",
            }));
          }}
          required
        >
          {offices.map((office) => (
            <SelectItem key={office.id.toString()} value={office.id.toString()}>
              {office.name}
            </SelectItem>
          ))}
        </Select>

        <div className="space-y-2">
          <Select
            label="Atanmış Danışmanlar"
            selectionMode="multiple"
            placeholder="Danışman seçin"
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
            isDisabled={!formData.officeId}
            required
          >
            {agents
              ?.filter((agent) => agent.officeId === Number(formData.officeId))
              .map((agent) => (
                <SelectItem
                  key={agent.id.toString()}
                  value={agent.id.toString()}
                >
                  {agent.name} {agent.surname}
                </SelectItem>
              ))}
          </Select>

          {selectedAgentNames.length > 0 && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">Seçilen Danışmanlar:</p>
              <ul className="mt-1 list-disc list-inside">
                {selectedAgentNames.map((name, index) => (
                  <li key={index} className="text-sm">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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
              selectedKeys={country ? [country] : []}
              onChange={handleCountryChange}
              required
            >
              {countries.map((item) => (
                <SelectItem
                  key={item.country_name}
                  value={item.country_name}
                  textValue={item.country_name}
                >
                  {item.country_name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Şehir"
              selectedKeys={city ? [city] : []}
              onChange={handleCityChange}
              required
              isLoading={isLoadingDistricts}
              isDisabled={!country}
            >
              {cityOptions.map((c) => (
                <SelectItem key={c} value={c} textValue={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="İlçe"
              selectedKeys={district ? [district] : []}
              onChange={handleDistrictChange}
              required
              isLoading={isLoadingNeighborhoods}
              isDisabled={!city}
            >
              {districtOptions.map((c) => (
                <SelectItem key={c.label} value={c.label} textValue={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Mahalle"
              selectedKeys={neighborhood ? [neighborhood] : []}
              onChange={handleNeighborhoodChange}
              required
              isDisabled={!district}
            >
              {neighborhoodOptions.map((c) => (
                <SelectItem key={c.label} value={c.label} textValue={c.label}>
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
