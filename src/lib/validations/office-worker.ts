import { z } from "zod";

export const OfficeWorkerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  about: z.string().optional(),
  roleId: z.string(),
  officeId: z.string(),
  webUrl: z.string().optional(),
  xAccountId: z.string().optional(),
  facebookAccountId: z.string().optional(),
  linkedInAccountId: z.string().optional(),
  instagramAccountId: z.string().optional(),
  youtubeAccountId: z.string().optional(),
  commercialDocumentId: z.string().optional(),
  companyLegalName: z.string().optional(),
  avatarUrl: z.string().optional(),
  userId: z.string().optional(),
});

export type OfficeWorkerFormType = z.infer<typeof OfficeWorkerSchema>;
