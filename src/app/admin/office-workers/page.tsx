import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { OfficeWorkerList } from "./_components/OfficeWorkerList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OfficeWorkersPage() {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ofis Çalışanları Yönetimi</h1>
        <Link href="/admin/office-workers/add">
          <Button>Yeni Çalışan Ekle</Button>
        </Link>
      </div>
      <OfficeWorkerList />
    </div>
  );
}
