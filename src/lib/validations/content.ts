import { z } from "zod";

export const contentSchema = z.object({
  key: z.string().min(1, "İçerik anahtarı zorunludur"),
  value: z.string().min(1, "İçerik değeri zorunludur"),
  description: z.string().optional(),
});

export type ContentInputType = z.infer<typeof contentSchema>;
