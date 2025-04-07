import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function uploadImages(images: File[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const uploadPromises = images.map(async (file) => {
      const fileName = file.name;
      const filePath = fileName;

      try {
        const { error: deleteError } = await supabase.storage
          .from("propertyImages")
          .remove([fileName]);

        if (deleteError) {
          console.log(`No existing file to delete:`, fileName);
        } else {
          console.log(`Deleted existing file:`, fileName);
        }
      } catch (deleteError) {
        console.log(`Error deleting existing file:`, deleteError);
      }

      const { data, error } = await supabase.storage
        .from("propertyImages")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from("propertyImages")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
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
