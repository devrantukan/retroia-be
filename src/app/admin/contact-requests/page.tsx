import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactRequestsTable from "@/app/admin/contact-requests/_components/ContactRequestsTable";
export default async function ContactRequestsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role is:", role);
  if (!user || role !== "office-workers") {
    redirect("/");
  }

  const contactRequests = await prisma.contactRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Requests</h1>
      <ContactRequestsTable contactRequests={contactRequests} />
    </div>
  );
}
