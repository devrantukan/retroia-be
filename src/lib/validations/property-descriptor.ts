import { z } from "zod";

export const categorySchema = z.object({
  value: z.string().min(1, "Kategori adı zorunludur"),
  slug: z.string().min(1, "Slug zorunludur"),
  typeId: z.number().min(1, "Mülk tipi seçimi zorunludur"),
});

export const descriptorSchema = z.object({
  value: z.string().min(1, "Tanımlayıcı adı zorunludur"),
  slug: z.string().min(1, "Slug zorunludur"),
  categoryId: z.number().min(1, "Kategori seçimi zorunludur"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type DescriptorFormData = z.infer<typeof descriptorSchema>;
