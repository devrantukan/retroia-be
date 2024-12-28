import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import PropertiesTable from "./_components/PropertiesTable";
import { getUserById } from "@/lib/actions/user";

const PAGE_SIZE = 8;

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
  console.log("user is:", user);
  console.log("dbuser is:", dbUser);
  console.log("act", role);

  const pagenum = searchParams.pagenum ?? 0;
  const propertiesPromise = prisma.property.findMany({
    where: role !== "site-admin" ? { userId: dbUser?.id } : {},

    include: {
      type: true,
      status: true,
      images: true,
    },
    skip: +pagenum * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const totalPropertiesPromise = prisma.property.count({
    where: {
      userId: user?.id,
    },
  });

  const [properties, totalProperties] = await Promise.all([
    propertiesPromise,
    totalPropertiesPromise,
  ]);

  const totalPages = Math.floor(totalProperties / PAGE_SIZE);

  console.log({ properties });

  return (
    <PropertiesTable
      properties={properties}
      totalPages={totalPages}
      currentPage={+pagenum}
    />
  );
};
export default PropertiesPage;
