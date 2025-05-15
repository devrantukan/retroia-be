import { Card, Button } from "@nextui-org/react";
import Image from "next/image";
import { XCircle, ArrowLeft, ArrowRight, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PictureCardProps {
  src: string;
  index: number;
  onDelete: () => void;
  isLoading?: boolean;
}

const PictureCard = ({
  src,
  index,
  onDelete,
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
    <div className="relative group cursor-move">
      <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={`Property image ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
      <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1.5 py-0.5 rounded text-xs">
        {index + 1}
      </div>
    </div>
  );
};

export default PictureCard;
