import { Card, Button } from "@nextui-org/react";
import Image from "next/image";
import { XCircle, ArrowLeft, ArrowRight, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PictureCardProps {
  src: string;
  index: number;
  onDelete?: (e: React.MouseEvent) => void;
  onMoveLeft?: (e: React.MouseEvent) => void;
  onMoveRight?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}

const PictureCard = ({
  src,
  index,
  onDelete,
  onMoveLeft,
  onMoveRight,
  isLoading = false,
}: PictureCardProps) => {
  // Handle different types of URLs
  const getImageUrl = (url: string) => {
    // If it's a blob URL (new upload), return as is
    if (url.startsWith("blob:")) {
      return url;
    }

    // If it's already a propertyImages URL, return as is
    if (url.includes("/propertyImages/")) {
      return url;
    }

    // If it's a property-images URL, convert to propertyImages
    if (url.includes("/property-images/")) {
      return url.replace("/property-images/", "/propertyImages/");
    }

    // If it's a filename without path, construct the full URL with propertyImages
    if (!url.includes("/")) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/propertyImages/${url}`;
    }

    return url;
  };

  const imageUrl = getImageUrl(src);

  return (
    <div className="relative group w-full aspect-video">
      {isLoading ? (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={`Image ${index + 1}`}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={src.startsWith("blob:")}
          priority={index < 3}
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onMoveLeft}
            className={cn(
              "p-2 rounded-full hover:bg-white/20 transition-colors",
              onMoveLeft
                ? "bg-white/10 cursor-pointer"
                : "bg-white/5 cursor-not-allowed"
            )}
            aria-label="Move image left"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Delete button clicked:", {
                originalSrc: src,
                transformedSrc: imageUrl,
                index,
              });
              onDelete?.(e);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Delete image"
          >
            <Trash className="w-6 h-6 text-white" />
          </Button>

          <Button
            type="button"
            onClick={onMoveRight}
            className={cn(
              "p-2 rounded-full hover:bg-white/20 transition-colors",
              onMoveRight
                ? "bg-white/10 cursor-pointer"
                : "bg-white/5 cursor-not-allowed"
            )}
            aria-label="Move image right"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PictureCard;
