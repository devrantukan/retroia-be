import { z } from "zod";

export const CountrySchema = z.object({
  country_name: z.string().min(2, "Ülke adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır"),
});

export const CitySchema = z.object({
  city_name: z.string().min(2, "Şehir adı en az 2 karakter olmalıdır"),
  country_id: z.number().min(1, "Lütfen bir ülke seçin"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır"),
});

export const DistrictSchema = z.object({
  district_name: z.string().min(2, "İlçe adı en az 2 karakter olmalıdır"),
  city_id: z.number().min(1, "Lütfen bir şehir seçin"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır"),
});

export const NeighborhoodSchema = z.object({
  neighborhood_name: z
    .string()
    .min(2, "Mahalle adı en az 2 karakter olmalıdır"),
  district_id: z.number().min(1, "Lütfen bir ilçe seçin"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır"),
});
