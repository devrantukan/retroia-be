import validator from "validator";
import { unknown, z } from "zod";

export const AddPropertyFormSchema = z.object({
  name: z.string().min(1, "Please Enter The Name"),
  description: z.string().min(2, "Enter the description"),
  videoSource: z.string().optional(),
  threeDSource: z.string().optional(),
  typeId: z
    .string()
    .min(1, "Select the type of your property")
    .transform((data: unknown) => Number(data)),
  subTypeId: z
    .string()
    .min(1, "Select the subtype of your property")
    .transform((data: unknown) => Number(data)),
  contractId: z
    .string()
    .min(1, "Select the contract type of your property")
    .transform((data: unknown) => Number(data)),
  agentId: z.number(),
  statusId: z
    .string()
    .min(1, "Select the status of your property")
    .transform((data: unknown) => Number(data)),
  price: z
    .string()
    .min(1, "Enter the price")
    .regex(new RegExp("^[0-9]+$"), "Please Enter Number")
    .transform((data: unknown) => Number(data)),
  discountedPrice: z.string().optional(),
  location: z.object({
    streetAddress: z.string().min(1, "Enter the street address"),
    city: z.string().min(1, "Enter the city name"),
    district: z.string().min(1, "Enter the district name"),
    neighborhood: z.string().min(1, "Enter the neighborhood name"),
    state: z.string().optional(),
    country: z.string().min(1, "Enter the country name"),
    // zip: z
    //   .string()
    //   .refine(
    //     (data) => validator.isPostalCode(data, "US"),
    //     "Enter the zip code"
    //   ),
    zip: z.string().optional(),
    region: z.string().optional(),
    landmark: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  propertyFeature: z.object({
    bedrooms: z
      .string()
      .regex(new RegExp("^[0-9]+$"), "Please enter number of the bedrooms")
      .transform((data: unknown) => Number(data)),
    bathrooms: z
      .string()
      .min(1, "Select bathroom number of your property")
      .regex(new RegExp("^[0-9]+$"), "Please enter number of the bathrooms")
      .transform((data: unknown) => Number(data)),
    floor: z.number(),
    totalFloor: z.number(),
    area: z.number(),
    hasSwimmingPool: z.boolean().default(false),
    hasGardenYard: z.boolean().default(false),
    hasBalcony: z.boolean().default(false),
  }),
  propertyDescriptors: z.object({
    alarm: z.boolean().default(false),
    mutfak: z.boolean().default(false),
    park: z.boolean().default(false),
    ruhsatli: z.boolean().default(false),
    wc: z.boolean().default(false),
    "yangin-merdiveni": z.boolean().default(false),

    dogu: z.boolean().default(false),
    bati: z.boolean().default(false),
    kuzey: z.boolean().default(false),
    guney: z.boolean().default(false),
    "amerikan-mutfak": z.boolean().default(false),
    balkon: z.boolean().default(false),
    "beyaz-esya": z.boolean().default(false),
    boyali: z.boolean().default(false),
    buzdolabi: z.boolean().default(false),
    "celik-kapi": z.boolean().default(false),
    "dusa-kabin": z.boolean().default(false),
    esyali: z.boolean().default(false),
    "hilton-banyo": z.boolean().default(false),
    "mutfak-ankastre": z.boolean().default(false),
    "mutfak-dogalgazi": z.boolean().default(false),
    "parke-zemin": z.boolean().default(false),
    "set-ustu-ocak": z.boolean().default(false),
    asansor: z.boolean().default(false),
    guvenlik: z.boolean().default(false),
    "isi-yalitim": z.boolean().default(false),
    "kamera-sistemi": z.boolean().default(false),
    kapici: z.boolean().default(false),
    otopark: z.boolean().default(false),
    "oyun-parki": z.boolean().default(false),
    "ses-yalitimi": z.boolean().default(false),
    "spor-alani": z.boolean().default(false),
    "yuzme-havuzu-acik": z.boolean().default(false),
    "yuzme-havuzu-kapali": z.boolean().default(false),
    cami: z.boolean().default(false),
    "doga-icinde": z.boolean().default(false),
    eczane: z.boolean().default(false),
    hastane: z.boolean().default(false),
    "ilkokul-ortaokul": z.boolean().default(false),
    lise: z.boolean().default(false),
    market: z.boolean().default(false),
    "otoyola-yakin": z.boolean().default(false),

    "saglik-ocagi": z.boolean().default(false),
    "semt-pazari": z.boolean().default(false),
    "spor-salonu": z.boolean().default(false),
    "sehir-merkezi": z.boolean().default(false),
    "toplu-ulasima-yakin": z.boolean().default(false),
    universite: z.boolean().default(false),
    otobus: z.boolean().default(false),
    "taksi-duragi": z.boolean().default(false),
    "ara-kat": z.boolean().default(false),
    doga: z.boolean().default(false),
    "park-yesil-alan": z.boolean().default(false),
    peyzaj: z.boolean().default(false),
  }),
});
