import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OfficeForm from "../../_components/OfficeForm";

export default async function EditOfficePage({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role is:", role);
  if (!user || role !== "site-admin") {
    redirect("/");
  }

  const office = await prisma.office.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      images: true,
      city: true,
      country: true,
      district: true,
      neighborhood: true,
      workers: true,
    },
  });

  console.log("office is:", office);

  if (!office) {
    redirect("/admin/offices");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Ofis Düzenle: {office.name}</h1>
      <OfficeForm mode="edit" office={office} />
    </div>
  );
}
