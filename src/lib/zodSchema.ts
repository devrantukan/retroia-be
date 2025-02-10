import validator from "validator";
import { unknown, z } from "zod";
import { prisma } from "./prisma";
import { cache } from "react";
import { getPropertyDescriptors } from "./actions/propertyDescriptors";

// Create the schema using the descriptors
export const getAddPropertyFormSchema = async () => {
  const descriptors = await getPropertyDescriptors();
  const descriptorsSchema = Object.fromEntries(
    Object.keys(descriptors).map((key) => [key, z.boolean().default(false)])
  );

  console.log(descriptorsSchema);

  return z.object({
    name: z.string().min(1, "Lütfen isim giriniz"),
    description: z.string().min(2, "Lütfen açıklama giriniz"),
    videoSource: z.string().optional(),
    threeDSource: z.string().optional(),
    typeId: z
      .string()
      .min(1, "Lütfen mülk tipini seçiniz")
      .transform((data: unknown) => Number(data)),
    subTypeId: z
      .string()
      .min(1, "Lütfen alt tipini seçiniz")
      .transform((data: unknown) => Number(data)),
    contractId: z
      .string()
      .min(1, "Lütfen sözleşme tipini seçiniz")
      .transform((data: unknown) => Number(data)),
    agentId: z.number(),
    statusId: z
      .string()
      .min(1, "Lütfen kontrat tipini seçiniz")
      .transform((data: unknown) => Number(data)),

    price: z
      .string()
      .min(1, "Price is required")
      .refine(
        (val) => {
          const cleanValue = val.replace(/\./g, "").replace(/\D/g, "");
          const number = Number(cleanValue);
          return !isNaN(number) && number > 0;
        },
        { message: "Price must be a positive number" }
      )
      .transform((val) => {
        const cleanValue = val.replace(/\./g, "").replace(/\D/g, "");
        return Number(cleanValue);
      }),
    discountedPrice: z.string().optional(),
    location: z.object({
      streetAddress: z.string().min(1, "Lütfen sokak adresini giriniz"),
      city: z.string().min(1, "Lütfen şehir giriniz"),
      district: z.string().min(1, "Lütfen ilçe giriniz"),
      neighborhood: z.string().min(1, "Lütfen mahalle giriniz"),
      state: z.string().optional(),
      country: z.string().min(1, "Lütfen ülke giriniz"),
      zip: z.string().optional(),
      region: z.string().optional(),
      landmark: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
    propertyFeature: z.object({
      bedrooms: z.string(),
      bathrooms: z.string(),
      floor: z.number(),
      totalFloor: z.number(),
      area: z.number(),
      hasSwimmingPool: z.boolean().default(false),
      hasGardenYard: z.boolean().default(false),
      hasBalcony: z.boolean().default(false),
    }),
    propertyDescriptors: z.object(descriptorsSchema),
    photos: z.array(z.instanceof(File)).optional(),
  });
};

// Type for the schema
export type AddPropertyInputType = z.infer<
  Awaited<ReturnType<typeof getAddPropertyFormSchema>>
>;

export const OfficeFormSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  fax: z.string().optional(),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  streetAddress: z.string().min(5, "Adres en az 5 karakter olmalıdır"),
  zip: z.string().min(5, "Posta kodu en az 5 karakter olmalıdır"),
  countryId: z.string(),
  cityId: z.string(),
  districtId: z.string(),
  neighborhoodId: z.string(),
  webUrl: z.string().url("Geçerli bir web adresi giriniz").optional(),
  xAccountId: z.string().optional(),
  facebookAccountId: z.string().optional(),
  linkedInAccountId: z.string().optional(),
  instagramAccountId: z.string().optional(),
  youtubeAccountId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type OfficeFormData = z.infer<typeof OfficeFormSchema>;
