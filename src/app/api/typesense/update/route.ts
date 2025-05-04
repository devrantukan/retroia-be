import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Client } from "typesense";

const client = new Client({
  nodes: [
    {
      host: "search.m1nd.xyz",
      port: 443,
      protocol: "https",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "xyz",
  connectionTimeoutSeconds: 6,
});

export async function POST(request: Request) {
  try {
    const { propertyId, isPublished } = await request.json();

    if (isPublished) {
      // Get property data
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          name: true,
          price: true,
          discountedPrice: true,
          type: true,
          contract: true,
          updatedAt: true,
          images: {
            select: {
              url: true,
            },
          },
          location: {
            select: {
              neighborhood: true,
              district: true,
              city: true,
              country: true,
              latitude: true,
              longitude: true,
            },
          },
          feature: {
            select: {
              bedrooms: true,
              bathrooms: true,
              area: true,
              hasBalcony: true,
              hasSwimmingPool: true,
              hasGardenYard: true,
              floor: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              surname: true,
              office: true,
              avatarUrl: true,
              slug: true,
              role: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Prepare document for Typesense
      const document = {
        id: property.id.toString(),
        title: property.name,
        description:
          "A deep dive into integrajting Typesense search engine with Next.js using Docker.",
        price: property.price,
        discountedPrice: property.discountedPrice,
        tags: ["Typesense", "Next.js", "Docker"],
        type: property.type.value,
        contract: property.contract.value,
        neighborhood: property.location?.neighborhood || "",
        district: property.location?.district || "",
        city: property.location?.city || "",
        country: property.location?.country || "",
        bedrooms: property.feature?.bedrooms || "",
        bathrooms: property.feature?.bathrooms || 0,
        area: property.feature?.area || 0,
        hasBalcony: property.feature?.hasBalcony || false,
        hasSwimmingPool: property.feature?.hasSwimmingPool || false,
        hasGardenYard: property.feature?.hasGardenYard || false,
        floor: property.feature?.floor || 0,
        agentId: property.agent.id,
        agentName: property.agent.name,
        images: property.images,
        agentSurname: property.agent.surname,
        agentAvatarUrl: property.agent.avatarUrl,
        agentSlug: property.agent.slug,
        agentRoleSlug: property.agent.role.slug,
        agentOffice: property.agent.office,
        published_date: Math.floor(
          new Date(property.updatedAt).getTime() / 1000
        ),
        category1: [property.contract.value],
        _geoloc: [
          parseFloat(property.location?.latitude?.toString() || "0"),
          parseFloat(property.location?.longitude?.toString() || "0"),
        ],
        location: {
          latitude: parseFloat(property.location?.latitude?.toString() || "0"),
          longitude: parseFloat(
            property.location?.longitude?.toString() || "0"
          ),
        },
      };

      // Upsert document in Typesense
      await client.collections("posts").documents().upsert(document);
    } else {
      // Delete document from Typesense if unpublished
      await client
        .collections("posts")
        .documents(propertyId.toString())
        .delete();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating Typesense:", error);
    return NextResponse.json(
      { error: "Failed to update Typesense" },
      { status: 500 }
    );
  }
}
