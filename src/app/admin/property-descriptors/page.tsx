import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import DescriptorsList from "./_components/DescriptorsList";
import {
  getCategories,
  getDescriptors,
  getPropertyTypes,
} from "@/lib/actions/property-descriptor";

export default async function PropertyDescriptorsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role is:", role);
  if (!user || role !== "site-admin") {
    redirect("/");
  }

  const [categories, descriptors, propertyTypes] = await Promise.all([
    getCategories(),
    getDescriptors(),
    getPropertyTypes(),
  ]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Özellik Tanımlayıcıları Yönetimi
      </h1>
      <DescriptorsList
        initialCategories={categories}
        initialDescriptors={descriptors}
        propertyTypes={propertyTypes}
      />
    </div>
  );
}
