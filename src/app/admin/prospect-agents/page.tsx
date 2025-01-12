import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProspectAgentsTable from "./_components/ProspectAgentsTable";

export default async function ProspectAgentsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role is:", role);
  if (!user || role !== "site-admin") {
    redirect("/");
  }

  const prospectAgents = await prisma.prospectAgent.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Danışman Adayları</h1>
      <ProspectAgentsTable prospectAgents={prospectAgents} />
    </div>
  );
}
