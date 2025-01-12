"use client";
import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import Link from "next/link";
import slugify from "slugify";
import { House } from "@phosphor-icons/react/dist/ssr";

export default function BreadCrumb({
  location,
  contract,
  propertyType,
}: {
  location: {
    country: string;
    city: string;
    district: string;
    neighborhood: string;
    subType: string;
  };
  contract: { slug: string; value: string };
  propertyType: { slug: string };
}) {
  const [currentPage, setCurrentPage] =
    React.useState<React.Key>("neighborhood");

  return (
    <Breadcrumbs underline="active" onAction={(key) => setCurrentPage(key)}>
      <BreadcrumbItem href="/" key="home" isCurrent={currentPage === "home"}>
        <House size={16} />
      </BreadcrumbItem>
      <BreadcrumbItem key="contract" isCurrent={currentPage === "contract"}>
        <Link href={`/${propertyType.slug}/${contract.slug}`}>
          {contract.value}
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem key="country" isCurrent={currentPage === "country"}>
        <Link
          href={`/${propertyType.slug}/${contract.slug}/${slugify(
            location.country,
            { lower: true }
          )}`}
        >
          {location.country} {contract.value}
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem key="city" isCurrent={currentPage === "city"}>
        <Link
          href={`/${propertyType.slug}/${contract.slug}/${slugify(
            location.country,
            { lower: true }
          )}/${slugify(location.city, { lower: true })}`}
        >
          {location.city} {contract.value}
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem key="district" isCurrent={currentPage === "district"}>
        <Link
          href={`/${propertyType.slug}/${contract.slug}/${slugify(
            location.country,
            { lower: true }
          )}/${slugify(location.city, { lower: true })}/${slugify(
            location.district,
            { lower: true }
          )}`}
        >
          {location.district} {contract.value}
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem
        key="neighborhood"
        isCurrent={currentPage === "neighborhood"}
      >
        <Link
          href={`/${propertyType.slug}/${contract.slug}/${slugify(
            location.country,
            { lower: true }
          )}/${slugify(location.city, { lower: true })}/${slugify(
            location.district,
            { lower: true }
          )}/${slugify(location.neighborhood, { lower: true })}`}
        >
          {location.neighborhood}
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem key="subType" isCurrent={currentPage === "subType"}>
        <Link href={"#"}>{location.subType}</Link>
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}
