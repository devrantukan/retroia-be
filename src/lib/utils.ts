import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function uploadToSupabase(file: File): Promise<string> {
  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `offices/${fileName}`;

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from("siteImages")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("siteImages").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    throw new Error("Failed to upload image");
  }
}

// Optional: Add a delete function if needed
export async function deleteFromSupabase(url: string) {
  try {
    // Extract the file path from the URL
    const path = url.split("siteImages/")[1];
    if (!path) return;

    const { error } = await supabase.storage.from("siteImages").remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting from Supabase:", error);
    throw new Error("Failed to delete image");
  }
}
