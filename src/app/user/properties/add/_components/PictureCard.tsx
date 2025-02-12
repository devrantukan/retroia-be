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
}

const PictureCard = ({
  src,
  index,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: PictureCardProps) => {
  return (
    <div className="relative group w-40 h-40">
      <Image
        src={src}
        alt={`Image ${index + 1}`}
        fill
        className="object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMoveLeft}
            className={cn(
              "p-2 rounded-full hover:bg-white/20 transition-colors",
              onMoveLeft
                ? "bg-white/10 cursor-pointer"
                : "bg-white/5 cursor-not-allowed"
            )}
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Trash className="w-6 h-6 text-white" />
          </button>

          <button
            type="button"
            onClick={onMoveRight}
            className={cn(
              "p-2 rounded-full hover:bg-white/20 transition-colors",
              onMoveRight
                ? "bg-white/10 cursor-pointer"
                : "bg-white/5 cursor-not-allowed"
            )}
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PictureCard;
