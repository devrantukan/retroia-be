import { getContents } from "@/app/actions/content";
import ContentsTable from "./_components/ContentsTable";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function ContentsPage({
  searchParams,
}: {
  searchParams: { pagenum?: string; search?: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "site-admin") {
    redirect("/");
  }

  const page = Number(searchParams.pagenum) || 1;
  const search = searchParams.search || "";

  const result = await getContents(page, search);

  if (!result.success) {
    return <div>Bir hata oluştu: {result.error}</div>;
  }

  const { data = [], totalPages = 1, currentPage = 1, total = 0 } = result;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İçerik Yönetimi</h1>
        <Link href="/admin/contents/new">
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
          >
            Yeni İçerik
          </Button>
        </Link>
      </div>

      <ContentsTable
        contents={data}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={total}
        searchTerm={search}
      />
    </div>
  );
}
