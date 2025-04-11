import { z } from "zod";

export const projectLocationSchema = z.object({
  streetAddress: z.string().min(1, "Adres zorunludur"),
  city: z.string().min(1, "Şehir zorunludur"),
  state: z.string().min(1, "İlçe zorunludur"),
  zip: z.string().min(1, "Posta kodu zorunludur"),
  country: z.string().min(1, "Ülke zorunludur"),
  landmark: z.string().default(""),
  district: z.string().min(1, "Bölge zorunludur"),
  neighborhood: z.string().min(1, "Mahalle zorunludur"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const projectUnitSizeSchema = z.object({
  value: z.string().min(1, "Birim büyüklüğü zorunludur"),
});

export const projectSocialFeaturesSchema = z.object({
  value: z.string().min(1, "Sosyal özellik zorunludur"),
});

export const projectImageSchema = z.object({
  url: z.string().url("Geçerli bir URL giriniz"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Proje adı zorunludur"),
  description: z.string().min(1, "Proje açıklaması zorunludur"),
  officeId: z.number().min(1, "Ofis seçimi zorunludur"),
  assignedAgents: z.string().min(1, "En az bir danışman seçilmelidir"),
  publishingStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
    required_error: "Yayın durumu zorunludur",
  }),
  startDate: z.date(),
  endDate: z.date(),
  deedInfo: z.string().min(1, "Tapu bilgisi zorunludur"),
  landArea: z.string().min(1, "Arsa alanı zorunludur"),
  nOfUnits: z.string().min(1, "Birim sayısı zorunludur"),
  slug: z.string().min(1, "Slug zorunludur"),
  catalogUrl: z.string().optional(),
  location: projectLocationSchema,
  unitSizes: z
    .array(projectUnitSizeSchema)
    .min(1, "En az bir birim büyüklüğü eklenmelidir"),
  socialFeatures: z
    .array(projectSocialFeaturesSchema)
    .min(1, "En az bir sosyal özellik eklenmelidir"),
  images: z.array(projectImageSchema).min(1, "En az bir görsel eklenmelidir"),
});
