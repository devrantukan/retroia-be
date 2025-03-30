import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import PropertiesTable from "./_components/PropertiesTable";
import { getUserById } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

const PropertySharePage = async ({ searchParams }: Props) => {
  const { getUser } = await getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect("/api/auth/login");
  }

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      officeWorker: true,
    },
  });

  if (!dbUser) {
    redirect("/api/auth/login");
  }

  const search = (searchParams.search as string) || "";
  const pagenum = +(searchParams.pagenum ?? 1) - 1;

  // Build where clause for search
  const where: Prisma.PropertyWhereInput = {
    publishingStatus: "PUBLISHED",
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              agent: {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            },
            {
              agent: {
                surname: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {}),
  };

  // Get total count with search filter
  const totalPropertiesPromise = await prisma.property.count({ where });

  const propertiesPromise = await prisma.property.findMany({
    where,
    include: {
      type: true,
      status: true,
      images: true,
      agent: true,
    },
    skip: Math.max(0, pagenum * PAGE_SIZE),
    take: PAGE_SIZE,
    orderBy: {
      id: "desc",
    },
  });

  const [properties, totalProperties] = await Promise.all([
    propertiesPromise,
    totalPropertiesPromise,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProperties / PAGE_SIZE));

  return (
    <PropertiesTable
      properties={properties}
      totalPages={totalPages}
      currentPage={+pagenum + 1}
      totalCount={totalProperties}
      searchTerm={search}
      user={{
        officeWorkerId: dbUser.officeWorker?.id || 0,
        slug: dbUser.officeWorker?.slug || "",
      }}
    />
  );
};

export default PropertySharePage;
