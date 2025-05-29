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

export async function uploadToSupabase(
  file: File,
  bucket: string = "office-images",
  fileName?: string
) {
  try {
    const fileExt = file.name.split(".").pop();
    const filePath = fileName || `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    throw new Error("Failed to upload image");
  }
}

export async function uploadProjectImage(file: File, projectName?: string) {
  try {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Please upload a JPEG, PNG, or WebP image."
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit.");
    }

    // Sanitize file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !["jpg", "jpeg", "png", "webp"].includes(fileExt)) {
      throw new Error(
        "Invalid file extension. Please upload a JPEG, PNG, or WebP image."
      );
    }

    // Sanitize project name for Windows compatibility
    const sanitizedProjectName = projectName
      ? projectName.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()
      : "";

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const fileName = sanitizedProjectName
      ? `${sanitizedProjectName}-${uniqueId}.${fileExt}`
      : `${uniqueId}.${fileExt}`;

    // First check if the file already exists
    const { data: existingFile } = await supabase.storage
      .from("project-images")
      .list(fileName);

    if (existingFile && existingFile.length > 0) {
      // If file exists, use a different unique ID
      const newUniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;
      const newFileName = sanitizedProjectName
        ? `${sanitizedProjectName}-${newUniqueId}.${fileExt}`
        : `${newUniqueId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("project-images")
        .upload(newFileName, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(newFileName);

      return urlData.publicUrl;
    }

    // If file doesn't exist, proceed with normal upload
    const { data, error } = await supabase.storage
      .from("project-images")
      .upload(fileName, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading project image to Supabase:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload project image");
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
