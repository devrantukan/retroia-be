import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
  lablText?: string;
  onSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  multiple?: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FileInput = React.forwardRef<HTMLInputElement, IProps>(
  (
    {
      children,
      className,
      lablText,
      onChange,
      onSelect,
      error,
      multiple = false,
      ...props
    },
    ref
  ) => {
    const [fileName, setFileName] = useState("");
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateFileName = (originalName: string): string => {
      // Get file extension
      const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";

      // Get the original filename without extension
      const nameWithoutExt = originalName.substring(
        0,
        originalName.lastIndexOf(".")
      );

      // Create timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .split(".")[0];

      // Create clean name using original filename
      return `${nameWithoutExt}_${timestamp}.${extension}`;
    };

    const createImageVersion = async (
      img: HTMLImageElement,
      width: number,
      height: number
    ): Promise<Blob> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(new Blob());

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Calculate scaling to ensure width matches target
        const scale = width / img.width;
        const scaledHeight = img.height * scale;

        // Calculate position to center vertically
        const y = (height - scaledHeight) / 2;

        // Fill background with white to prevent transparency
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the scaled image
        ctx.drawImage(img, 0, y, width, scaledHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(new Blob());
            }
          },
          "image/jpeg",
          0.95
        );
      });
    };

    const uploadToBucket = async (
      file: Blob,
      fileName: string,
      bucket: string
    ): Promise<string> => {
      try {
        // Ensure fileName is a string and trim any whitespace
        const cleanFileName = String(fileName).trim();

        console.log(`Attempting to upload to ${bucket}:`, {
          originalFileName: fileName,
          cleanFileName,
          fileSize: file.size,
          fileType: file.type,
        });

        // First, try to delete the existing file if it exists
        try {
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([cleanFileName]);

          if (deleteError) {
            console.log(
              `No existing file to delete in ${bucket}:`,
              cleanFileName
            );
          } else {
            console.log(`Deleted existing file from ${bucket}:`, cleanFileName);
          }
        } catch (deleteError) {
          console.log(
            `Error deleting existing file from ${bucket}:`,
            deleteError
          );
        }

        // Now upload the new file
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(cleanFileName, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: "image/jpeg",
          });

        if (error) {
          console.error(`Error uploading to ${bucket}:`, {
            error,
            fileName: cleanFileName,
            bucket,
          });
          throw error;
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(cleanFileName);

        console.log(`Successfully uploaded to ${bucket}:`, {
          publicUrl: urlData.publicUrl,
          fileName: cleanFileName,
        });
        return urlData.publicUrl;
      } catch (error) {
        console.error(`Failed to upload to ${bucket}:`, error);
        throw error;
      }
    };

    const processAndUploadImage = async (file: File): Promise<File | null> => {
      return new Promise((resolve) => {
        const img = document.createElement("img");
        img.onload = async () => {
          try {
            console.log("Processing image:", {
              originalSize: file.size,
              originalType: file.type,
              dimensions: `${img.width}x${img.height}`,
            });

            // Use original filename for all versions
            const baseFileName = file.name;
            console.log("Using original filename:", baseFileName);

            // Create and upload original version (resized to 1920x1080)
            const originalBlob = await createImageVersion(img, 1920, 1080);
            const originalUrl = await uploadToBucket(
              originalBlob,
              baseFileName,
              "propertyImages"
            );
            console.log("Original uploaded with filename:", baseFileName);

            // Create and upload large version (resized to 1280x720)
            const largeBlob = await createImageVersion(img, 1280, 720);
            const largeUrl = await uploadToBucket(
              largeBlob,
              baseFileName,
              "property-images"
            );
            console.log("Large version uploaded with filename:", baseFileName);

            // Create and upload thumbnail version (resized to 400x225)
            const thumbnailBlob = await createImageVersion(img, 400, 225);
            const thumbnailUrl = await uploadToBucket(
              thumbnailBlob,
              baseFileName,
              "thumbnails-property-images"
            );
            console.log("Thumbnail uploaded with filename:", baseFileName);

            console.log("Uploaded image versions:", {
              original: originalUrl,
              large: largeUrl,
              thumbnail: thumbnailUrl,
              baseFileName,
            });

            // Create a new File object with the same name and add order property
            const formFile = new File([originalBlob], baseFileName, {
              type: "image/jpeg",
            });

            // Add order, url, and name properties to the File object
            Object.defineProperties(formFile, {
              order: {
                value: 0,
                writable: true,
                enumerable: true,
                configurable: true,
              },
              url: {
                value: originalUrl,
                writable: true,
                enumerable: true,
                configurable: true,
              },
              name: {
                value: baseFileName,
                writable: true,
                enumerable: true,
                configurable: true,
              },
            });

            resolve(formFile);
          } catch (error: any) {
            console.error("Error processing image:", {
              error,
              fileName: file.name,
              fileSize: file.size,
            });
            toast.error(`Görüntü yüklenirken hata oluştu: ${error.message}`);
            resolve(null);
          }
        };

        img.onerror = (error) => {
          console.error("Error loading image:", error);
          toast.error("Görüntü yüklenirken hata oluştu");
          resolve(null);
        };

        img.src = URL.createObjectURL(file);
      });
    };

    const fileChangedHandler = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      event.preventDefault();
      const files = event.target.files;
      if (!files) return;

      const validFiles = Array.from(files).filter((file) =>
        ["image/jpeg", "image/png"].includes(file.type)
      );

      if (validFiles.length !== files.length) {
        toast.error("Sadece JPEG ve PNG dosyaları yüklenebilir");
        return;
      }

      try {
        console.log("Starting to process files:", validFiles.length);
        const processedFiles = await Promise.all(
          validFiles.map(async (file) => {
            const processedFile = await processAndUploadImage(file);
            return processedFile;
          })
        );

        const validProcessedFiles = processedFiles.filter(
          (file): file is File => file !== null
        );

        if (validProcessedFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          validProcessedFiles.forEach((file) => dataTransfer.items.add(file));

          const newEvent = {
            target: {
              files: dataTransfer.files,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          if (onSelect) onSelect(newEvent);
          if (onChange) onChange(newEvent);

          setFileName(validProcessedFiles.map((f) => f.name).join(", "));
          toast.success(
            `${validProcessedFiles.length} görüntü başarıyla yüklendi`
          );
        } else {
          toast.error("Hiçbir görüntü yüklenemedi");
        }
      } catch (error) {
        console.error("Error processing images:", error);
        toast.error("Görüntüler işlenirken bir hata oluştu");
      }
    };

    return (
      <div className={className}>
        {lablText && (
          <label
            className="block text-gray-600 text-xs lg:text-sm xl:text-base mb-2"
            htmlFor="txt"
          >
            {lablText}
          </label>
        )}
        <label className="w-full relative border flex rounded-md cursor-pointer group">
          <div className="inline-block h-full py-3 rounded-l-md px-2 text-white transition duration-500 bg-primary-500 hover:bg-primary-700 shadow shadow-violet-600/25 hover:shadow-primary-600/75">
            <input
              className="hidden"
              ref={ref}
              onChange={fileChangedHandler}
              {...props}
              type="file"
              multiple={multiple}
              accept="image/jpeg, image/png"
            />
            Dosya Yükle
          </div>
          <div className="flex items-center my-2 ml-2 h-8">{fileName}</div>
        </label>
        {error && (
          <p className="text-red-600 text-right animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";
export default FileInput;
