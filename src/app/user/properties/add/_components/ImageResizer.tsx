import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@nextui-org/react";
import Image from "next/image";

// Add custom CSS to hide crop layer
const cropStyles = `
  .ReactCrop__crop-selection {
    border: none !important;
    background: transparent !important;
  }
  .ReactCrop__drag-handle {
    display: none !important;
  }
  .ReactCrop__drag-bar {
    display: none !important;
  }
`;

interface ImageResizerProps {
  image: File;
  onResize: (resizedImage: File) => void;
  targetBucket:
    | "propertyImages"
    | "property-images"
    | "thumbnails-property-images";
  onCancel: () => void;
}

const ImageResizer: React.FC<ImageResizerProps> = ({
  image,
  onResize,
  targetBucket,
  onCancel,
}) => {
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResize = useCallback(async () => {
    if (!imageRef || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      const getTargetDimensions = () => {
        switch (targetBucket) {
          case "property-images":
            return { width: 1920, height: 1080 };
          case "thumbnails-property-images":
            return { width: 400, height: 225 };
          default:
            return null;
        }
      };

      const targetDimensions = getTargetDimensions();
      if (!targetDimensions) {
        onResize(image);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate aspect ratios
      const targetAspectRatio =
        targetDimensions.width / targetDimensions.height;
      const imageAspectRatio = imageRef.naturalWidth / imageRef.naturalHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = imageRef.naturalWidth;
      let sourceHeight = imageRef.naturalHeight;

      // Calculate crop dimensions to maintain aspect ratio
      if (imageAspectRatio > targetAspectRatio) {
        // Image is wider than target
        sourceWidth = imageRef.naturalHeight * targetAspectRatio;
        sourceX = (imageRef.naturalWidth - sourceWidth) / 2;
      } else {
        // Image is taller than target
        sourceHeight = imageRef.naturalWidth / targetAspectRatio;
        sourceY = (imageRef.naturalHeight - sourceHeight) / 2;
      }

      // Set canvas dimensions
      canvas.width = targetDimensions.width;
      canvas.height = targetDimensions.height;

      // Draw the cropped and resized image
      ctx.drawImage(
        imageRef,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetDimensions.width,
        targetDimensions.height
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], image.name, {
              type: image.type,
            });
            onResize(resizedFile);
          }
        },
        image.type,
        0.95
      );
    } finally {
      setIsProcessing(false);
    }
  }, [imageRef, image, onResize, targetBucket, isProcessing]);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageRef(e.currentTarget);
    },
    []
  );

  useEffect(() => {
    if (imageRef && !isProcessing) {
      handleResize();
    }
  }, [imageRef, handleResize, isProcessing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageRef) {
        URL.revokeObjectURL(imageRef.src);
      }
    };
  }, [imageRef]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <Image
          src={URL.createObjectURL(image)}
          onLoad={handleImageLoad}
          alt="Preview"
          width={1920}
          height={1080}
          unoptimized
          className="max-w-full h-auto"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex justify-end gap-2">
          <Button color="danger" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;
