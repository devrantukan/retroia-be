"use client";
import BreadCrumb from "@/app/components/BreadCrumb";
import DescriptorsAccordion from "@/app/components/DescriptorsAccordion";
import { ImagesSlider } from "@/app/components/ImageSlider";
import PageTitle from "@/app/components/pageTitle";
import ShowOnMapButton from "@/app/components/ShowOnMapButton";
import prisma from "@/lib/prisma";
import { Card } from "@nextui-org/react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import {
  CheckCircle,
  EnvelopeSimple,
  Phone,
  Spinner,
  User,
  X,
} from "@phosphor-icons/react/dist/ssr";

import { notFound } from "next/navigation";
import React from "react";
import ImageGallery from "react-image-gallery";

import "react-image-gallery/styles/css/image-gallery.css";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

import Image from "next/image";
import Link from "next/link";

interface PropertyImage {
  id: string;
  fullSize: string;
  thumbnailUrl: string;
}

interface Props {
  params: {
    id: string;
  };
}

const PropertyPage = ({ params }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [property, setProperty] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [descriptorsGrouped, setDescriptorsGrouped] = React.useState<
    Record<string, any[]>
  >({});

  const defaultImage = {
    original: "https://picsum.photos/id/1018/1000/600",
    thumbnail: "https://picsum.photos/id/1018/250/150",
  };

  console.log(property);
  const getGalleryImages = (propertyImages: any[]) => {
    let galleryItems = [];

    // Add video if it exists and is a valid URL
    if (property?.videoSource && property.videoSource.startsWith("http")) {
      // Check if it's a YouTube URL
      if (
        property.videoSource.includes("youtube.com") ||
        property.videoSource.includes("youtu.be")
      ) {
        // Convert URL to embed format
        const videoId = property.videoSource.includes("youtube.com")
          ? property.videoSource.split("v=")[1]
          : property.videoSource.split("youtu.be/")[1];

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        galleryItems.push({
          original: property.videoSource,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          renderItem: () => (
            <div className="w-full h-full" style={{ aspectRatio: "16/9" }}>
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="image-gallery-image"
              />
            </div>
          ),
        });
      } else {
        // Handle regular video files
        galleryItems.push({
          original: property.videoSource,
          thumbnail: property.videoSource,
          renderItem: () => (
            <video
              controls
              className="image-gallery-image"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            >
              <source src={property.videoSource} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ),
        });
      }
    }

    // Add images if they exist
    if (propertyImages && propertyImages.length > 0) {
      const imageItems = propertyImages.map((image) => ({
        original: image.url,
        thumbnail: image.url,
      }));
      galleryItems = [...galleryItems, ...imageItems];
    }

    return galleryItems.length > 0 ? galleryItems : [defaultImage];
  };

  React.useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        if (!response.ok) {
          throw new Error("Property not found");
        }
        const data = await response.json();
        setProperty(data);

        if (data && data.descriptors) {
          const descriptors = data.descriptors.map((descriptor: any) => ({
            category: descriptor.descriptor.category.value,
            descriptor: descriptor.descriptor.value,
          }));

          const grouped = descriptors.reduce(
            (acc: Record<string, any[]>, curr: any) => {
              if (!acc[curr.category]) {
                acc[curr.category] = [];
              }
              acc[curr.category].push(curr);
              return acc;
            },
            {}
          );

          setDescriptorsGrouped(grouped);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Spinner
          size={48}
          className="text-primary animate-spin"
          weight="bold"
        />
      </div>
    );
  }

  if (!property) {
    return notFound();
  }

  return (
    <div className="w-full">
      <div className="p-6 pb-0">
        <BreadCrumb
          location={{
            country: property.location?.country || "",
            city: property.location?.city || "",
            district: property.location?.district || "",
            neighborhood: property.location?.neighborhood || "",
            subType: property.subType.value || "",
          }}
          contract={property.contract}
          propertyType={property.type}
        />
        <div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between">
            <div className="w-full lg:w-3/4">
              <h2 className="text-2xl font-bold text-primary my-5">
                {property.name}
              </h2>
            </div>
            <div className="w-full lg:w-1/4 lg:text-right text-left">
              {property.discountedPrice > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {property.discountedPrice.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span className="text-lg line-through text-gray-400">
                      {property.price.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      İNDİRİMLİ
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {property.price.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                    maximumFractionDigits: 0,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex lg:flex-row flex-col ">
        <div className="p-4 flex flex-col lg:w-2/3 w-full">
          <div className="flex flex-col">
            <div className="w-full">
              <ImageGallery
                items={getGalleryImages(property.images)}
                additionalClass="aspect-ratio-gallery"
              />
              <style jsx global>{`
                .image-gallery-image {
                  aspect-ratio: 16/9 !important;
                  object-fit: cover;
                  border-radius: 0.75rem !important;
                }
                .image-gallery-thumbnail-image {
                  aspect-ratio: 16/9 !important;
                  object-fit: cover;
                }
                .image-gallery-slide {
                  aspect-ratio: 16/9 !important;
                }
                .image-gallery-content
                  .image-gallery-slide
                  .image-gallery-image {
                  border-radius: 0.75rem !important;
                }
                iframe.image-gallery-image {
                  border-radius: 0.75rem !important;
                }
                video.image-gallery-image {
                  border-radius: 0.75rem !important;
                }
              `}</style>
            </div>

            <h3 className="text-xl font-bold mt-6">İlan Açıklaması</h3>
            <p
              className="text-sm text-slate-600 mt-7"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />
          </div>
        </div>
        <div className="flex lg:w-1/3 w-full mb-6 mt-4 mr-4 h-[560px]">
          <Card className="p-5 flex flex-col gap-1 w-full">
            <Title title="Özellikler" />
            <Attribute label="Oda Sayısı" value={property.feature?.bedrooms} />
            <Attribute
              label="Banyo Sayısı"
              value={property.feature?.bathrooms}
            />
            <Attribute label="Bulunduğu kat" value={property.feature?.floor} />
            <Attribute
              label="Binadaki kat sayısı"
              value={property.feature?.totalFloor}
            />
            <Attribute label="Alan" value={property.feature?.area + " m2"} />

            <Title title="Adres Bilgileri" className="mt-7" />
            <Attribute label="Şehir" value={property.location?.city} />
            <Attribute label="İlçe" value={property.location?.district} />
            <Attribute
              label="Mahalle"
              value={property.location?.neighborhood}
            />
            <div className="mt-6 w-full flex flex-row  gap-1 justify-between items-center">
              <div className="lg:w-1/2">
                {property.location?.latitude !== 0 &&
                  property.location?.longitude !== 0 && (
                    <ShowOnMapButton
                      lat={property.location.latitude}
                      lng={property.location.longitude}
                    />
                  )}
              </div>
              {property.threeDSource &&
                property.threeDSource.startsWith("http") && (
                  <div className="lg:w-1/2">
                    <Button
                      onPress={onOpen}
                      className="w-full bg-blue-950 text-white py-2 rounded-xl 
                    hover:bg-blue-900 hover:scale-[1.01] transition-all duration-300 
                    flex items-center justify-center gap-2 group"
                    >
                      <span>3D Sanal Tur</span>
                    </Button>
                  </div>
                )}
            </div>

            <Title title="Danışman Detayları" className="mt-6" />
            <div className="flex items-start space-x-3 p-2 justify-between ">
              {/* Agent Avatar */}
              <div className="flex-shrink-0 w-24 h-24 ">
                {property.agent?.avatarUrl ? (
                  <Image
                    src={property.agent.avatarUrl}
                    alt={property.agent.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <User size={48} weight="light" className="text-gray-400" />
                )}
              </div>

              {/* Agent Details */}
              <div className="flex-grow">
                <h3 className="text-base font-semibold mb-2  text-right">
                  <Link
                    href={`/ofis/${property.agent?.officeId}/${property.agent?.office.slug}/${property.agent?.role.slug}/${property.agent?.id}/${property.agent?.slug}`}
                  >
                    {property.agent?.name} {property.agent?.surname}
                  </Link>
                </h3>

                <div className="space-y-1 text-right">
                  {/* Email with icon */}
                  <a
                    href={`mailto:${property.agent?.email}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 justify-end text-sm"
                  >
                    <EnvelopeSimple size={20} weight="light" className="mr-2" />
                    {property.agent?.email}
                  </a>

                  {/* Phone with icon */}
                  <a
                    href={`tel:${property.agent?.phone}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 justify-end text-sm"
                  >
                    <Phone size={20} weight="light" className="mr-2" />
                    {property.agent?.phone}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {descriptorsGrouped && Object.keys(descriptorsGrouped).length > 0 && (
        <div className="w-full px-4 mb-12">
          <h3 className="text-xl font-bold mt-4">İlan Özellikleri</h3>
          <DescriptorsAccordion descriptorsGrouped={descriptorsGrouped} />
        </div>
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        scrollBehavior="inside"
        hideCloseButton={false}
        placement="top-center"
        closeButton={<div className="  mt-2 mr-2" />}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
        classNames={{
          base: "mt-0 !rounded-b-xl",
          wrapper: "mt-0",
          body: "!rounded-b-xl overflow-hidden ",
        }}
      >
        <ModalContent className="lg:h-[90vh] h-auto mt-0">
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center">
                3D Sanal Tur
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </ModalHeader>
              <ModalBody className="p-0 rounded-b-xl overflow-hidden">
                <div className="w-full aspect-[16/9]">
                  <iframe
                    src={property.threeDSource}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
export default PropertyPage;

const Title = ({ title, className }: { title: string; className?: string }) => (
  <div className={className}>
    <h2 className="text-xl font-bold text-slate-700">{title} </h2>
    <hr className="border border-solid border-slate-300" />
  </div>
);

const Attribute = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <div className="flex justify-between">
    <span className="text-sm text-slate-600">{label}</span>
    <span className="text-sm text-slate-600">{value}</span>
  </div>
);
