import validator from "validator";
import { unknown, z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  about: z.string().max(500, "About must be 500 characters or less").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
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
