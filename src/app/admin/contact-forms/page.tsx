import { getContactForms } from "@/lib/actions/contact-form";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import ContactFormsTable from "./_components/ContactFormsTable";

export default async function ContactFormsPage({
  searchParams,
}: {
  searchParams: { pagenum: string };
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

  const page = searchParams.pagenum ? parseInt(searchParams.pagenum) : 1;
  const { contactForms, total, totalPages } = await getContactForms(page);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">İletişim Formları</h1>
      <ContactFormsTable
        contactForms={contactForms}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
