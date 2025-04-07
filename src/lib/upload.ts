import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function uploadImages(images: File[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const uploadPromises = images.map(async (file) => {
      // Use the original filename
      const fileName = file.name;
      console.log("Using original filename:", fileName);

      // Function to handle upload to a specific bucket
      const uploadToBucket = async (bucket: string, file: Blob | File) => {
        try {
          // First, try to delete the existing file if it exists
          try {
            const { error: deleteError } = await supabase.storage
              .from(bucket)
              .remove([fileName]);

            if (deleteError) {
              console.log(`No existing file to delete in ${bucket}:`, fileName);
            } else {
              console.log(`Deleted existing file from ${bucket}:`, fileName);
            }
          } catch (deleteError) {
            console.log(
              `Error deleting existing file from ${bucket}:`,
              deleteError
            );
          }

          // Upload the file
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: true,
              contentType: "image/jpeg",
            });

          if (error) {
            console.error(`Error uploading to ${bucket}:`, error);
            throw error;
          }

          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

          console.log(`Successfully uploaded to ${bucket}:`, {
            publicUrl: urlData.publicUrl,
            fileName,
          });

          return urlData.publicUrl;
        } catch (error) {
          console.error(`Failed to upload to ${bucket}:`, error);
          throw error;
        }
      };

      // Upload to all three buckets with the same filename
      const originalUrl = await uploadToBucket("propertyImages", file);
      const largeUrl = await uploadToBucket("property-images", file);
      const thumbnailUrl = await uploadToBucket(
        "thumbnails-property-images",
        file
      );

      // Return just the URL string for the database
      return originalUrl;
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
