import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  phone: z.string().optional(),
  about: z.string().optional(),
  avatarUrl: z.string().optional(),
  commercialDocumentId: z.string().optional(),
  companyLegalName: z.string().optional(),
  xAccountId: z.string().optional(),
  facebookAccountId: z.string().optional(),
  linkedInAccountId: z.string().optional(),
  youtubeAccountId: z.string().optional(),
  instagramAccountId: z.string().optional(),
  webUrl: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
