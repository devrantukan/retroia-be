import validator from "validator";
import { unknown, z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  about: z
    .string()
    .max(10000, "About must be 500 characters or less")
    .optional(),
  phone: z
    .string()
    .regex(
      /^\+90\s[0-9]{3}\s[0-9]{3}\s[0-9]{2}\s[0-9]{2}$/,
      "Geçerli bir telefon numarası giriniz (+90 5XX XXX XX XX)"
    )
    .optional(),
  //  title: z.string().optional(),
  xAccountId: z.string().optional(),
  facebookAccountId: z.string().optional(),
  linkedInAccountId: z.string().optional(),
  youtubeAccountId: z.string().optional(),
  webUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramAccountId: z.string().optional(),
  commercialDocumentId: z.string().optional(),
  companyLegalName: z.string().optional(),
  // role: z.string().min(1, "Role is required"),
  // office: z.string().min(1, "Office is required"),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
