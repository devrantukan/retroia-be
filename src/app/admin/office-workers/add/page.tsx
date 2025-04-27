import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { OfficeWorkerForm } from "../_components/OfficeWorkerForm";
import { createClient } from "@kinde-oss/kinde-node";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AddOfficeWorkerPage() {
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
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Yeni Çalışan Ekle</h1>
      <OfficeWorkerForm />
    </div>
  );
}
