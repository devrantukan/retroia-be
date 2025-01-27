import { z } from "zod";

export const ContactFormSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  officeId: z.string().min(1, "Ofis seçimi zorunludur"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır"),
  status: z.enum(["PENDING", "PROCESSED", "REJECTED"]).default("PENDING"),
});

export type ContactFormType = z.infer<typeof ContactFormSchema>;
