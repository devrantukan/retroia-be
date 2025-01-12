import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OfficeForm from "../_components/OfficeForm";

export default async function AddOfficePage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role is:", role);
  if (!user || role !== "site-admin") {
    redirect("/");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Yeni Ofis Ekle</h1>
      <OfficeForm mode="add" />
    </div>
  );
}
