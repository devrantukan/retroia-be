import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OfficesTable from "./_components/OfficesTable";
import { Button } from "@nextui-org/react";
import Link from "next/link";

export default async function OfficesPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role is:", role);
  if (!user || role !== "site-admin") {
    redirect("/");
  }
  const offices = await prisma.office.findMany({
    include: {
      city: {
        select: {
          city_id: true,
          city_name: true,
          country_id: true,
          country_name: true,
          slug: true,
        },
      },
      country: true,
      district: true,
      neighborhood: true,
      workers: true,
      images: true,
      projects: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ofisler</h1>
        <Link href="/admin/offices/add">
          <Button color="primary">Yeni Ofis Ekle</Button>
        </Link>
      </div>
      <OfficesTable offices={offices as any} />
    </div>
  );
}
