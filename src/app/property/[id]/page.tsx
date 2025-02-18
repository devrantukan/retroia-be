import { Metadata } from "next";
import PropertyPageClient from "./PropertyPageClient";
import { headers } from "next/headers";
import { getPropertyById } from "@/lib/actions/property"; // assuming this is the correct function name

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const headersList = headers();
  const domain = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${domain}`;

  // Fetch property data first
  const property = await getPropertyById(params.id);

  if (!property) {
    return {
      title: "İlan bulunamadı",
      description: "İlan detayları bulunamadı.",
    };
  }

  const locationString = [
    property.location?.neighborhood ?? "",
    property.location?.district ?? "",
    property.location?.city,
    "Türkiye",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://emlak.retroia.com"
    ),
    title: property.name || "İlan Detayları",
    description: `${property.feature?.bedrooms ?? ""} Yatak Odalı, ${
      property.feature?.bathrooms ?? ""
    } Banyolu, ${property.feature?.area ?? ""}m² ${
      property.type?.value ?? ""
    } ${
      property.contract?.value === "sale" ? "Satılık" : "Kiralık"
    } - ${locationString}`,
    keywords: `${property.type?.value ?? ""}, ${
      property.contract?.value === "sale" ? "satılık" : "kiralık"
    }, ${property.location?.city ?? ""}, ${
      property.location?.district ?? ""
    }, ${property.location?.neighborhood ?? ""}, emlak, gayrimenkul`,
    openGraph: {
      title: property.name ?? "",
      description: property.description ?? "",
      images:
        property.images?.map((img: { url: string }) => ({
          url: img.url,
        })) || [],
      siteName: "Retroia",
      locale: "tr_TR",
      type: "article",
      url: `/property/${params.id}`,
      authors: [property.agent?.name ?? ""],
      publishedTime: property.createdAt?.toString(),
      modifiedTime: property.updatedAt?.toString(),
      section: "Real Estate",
      tags: [
        property.type?.value ?? "",
        property.contract?.value === "sale" ? "satılık" : "kiralık",
        property.location?.city ?? "",
        property.location?.district ?? "",
        property.location?.neighborhood ?? "",
        "emlak",
        "gayrimenkul",
      ].filter(Boolean),
    },
    alternates: {
      canonical: `/property/${params.id}`,
    },
    other: {
      "geo.position": `${property.location?.latitude};${property.location?.longitude}`,
      "geo.placename": locationString,
      "geo.region": "TR",
    },
  };
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  return <PropertyPageClient params={params} />;
}
