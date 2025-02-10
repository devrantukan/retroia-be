import { Card } from "@nextui-org/react";
import Image from "next/image";
import { XCircle, ArrowLeft, ArrowRight } from "@phosphor-icons/react";

interface Props {
  src: string;
  index: number;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

const PictureCard = ({
  src,
  index,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: Props) => {
  return (
    <Card className="relative group">
      <Image
        src={src}
        width={200}
        height={200}
        alt={`Property Image ${index + 1}`}
        className="object-cover"
      />
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1"
      >
        <XCircle size={24} />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveLeft && (
          <button
            onClick={onMoveLeft}
            className="text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        {onMoveRight && (
          <button
            onClick={onMoveRight}
            className="text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <ArrowRight size={24} />
          </button>
        )}
      </div>
    </Card>
  );
};

export default PictureCard;
