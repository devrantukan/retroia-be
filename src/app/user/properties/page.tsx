import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import PropertiesTable from "./_components/PropertiesTable";
import { getUserById } from "@/lib/actions/user";

const PAGE_SIZE = 12;

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

const PropertiesPage = async ({ searchParams }: Props) => {
  const { getUser } = await getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  const dbUser = await getUserById(user ? user.id : "");
  // console.log("user is:", user);
  // console.log("dbuser is:", dbUser);
  // console.log("act", role);

  const pagenum = +(searchParams.pagenum ?? 1) - 1;
  // console.log("pagenum is:", pagenum);

  // Get total count based on user role
  const totalPropertiesPromise = await prisma.property.count({
    where: role !== "site-admin" ? { userId: dbUser?.id } : {},
  });

  const propertiesPromise = await prisma.property.findMany({
    where: role !== "site-admin" ? { userId: dbUser?.id } : {},
    include: {
      type: true,
      status: true,
      images: true,
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

  //  console.log("totalProperties is:", totalProperties);

  // Calculate total pages, ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalProperties / PAGE_SIZE));
  console.log("totalPages is:", totalPages);
  return (
    <PropertiesTable
      properties={properties}
      totalPages={totalPages}
      currentPage={+pagenum + 1}
    />
  );
};
export default PropertiesPage;
