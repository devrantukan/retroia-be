import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function uploadImages(images: File[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const data = await Promise.all(
    images.map((file) =>
      supabase.storage
        .from("propertyImages")
        .upload(`${file.name}_${Date.now()}`, file)
    )
  );

  const urls = data.map(
    (item) =>
      supabase.storage
        .from("propertyImages")
        .getPublicUrl(item.data?.path ?? "").data.publicUrl
  );

  return urls;
}

export async function uploadAvatar(image: File, name: string, surname: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: supabaseKey,
      },
    },
  });

  // Create slug from name and surname
  const slug = `${name}-${surname}`
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Upload with slugified name
  const data = await supabase.storage
    .from("avatars")
    .upload(
      `${slug}-${Date.now()}${image.name.slice(image.name.lastIndexOf("."))}`,
      image
    );

  const urlData = await supabase.storage
    .from("avatars")
    .getPublicUrl(data.data?.path!);

  return urlData.data.publicUrl;
}
