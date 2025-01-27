import { z } from "zod";

export const OfficeFormSchema = z.object({
  name: z.string().min(2, "Ofis adı en az 2 karakter olmalıdır"),
  slug: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  streetAddress: z.string().min(5, "Geçerli bir adres giriniz"),
  countryId: z.number().optional(),
  cityId: z.number().optional(),
  districtId: z.number().optional(),
  neighborhoodId: z.number().optional(),
  zip: z.string().optional(),
  fax: z.string().optional(),
  webUrl: z.string().url("Geçerli bir web sitesi adresi giriniz").optional(),
  xAccountId: z.string().optional(),
  facebookAccountId: z.string().optional(),
  linkedInAccountId: z.string().optional(),
  instagramAccountId: z.string().optional(),
  youtubeAccountId: z.string().optional(),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
});

export type OfficeFormType = z.infer<typeof OfficeFormSchema>;
