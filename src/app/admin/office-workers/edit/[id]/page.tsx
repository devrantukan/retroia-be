import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { OfficeWorkerForm } from "../../_components/OfficeWorkerForm";
import { getOfficeWorker } from "@/lib/actions/office-worker";

export default async function EditOfficeWorkerPage({
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

  const worker = await getOfficeWorker(parseInt(params.id));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Çalışan Düzenle</h1>
      <OfficeWorkerForm worker={worker} />
    </div>
  );
}
