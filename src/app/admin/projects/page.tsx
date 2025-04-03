import { getProjects } from "@/app/actions/project";
import ProjectsTable from "./_components/ProjectsTable";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function ProjectsPage({
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

  const result = await getProjects(page, search);

  if (!result.success) {
    return <div>Bir hata oluştu: {result.error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projeler</h1>
        <Link href="/admin/projects/new">
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
          >
            Yeni Proje
          </Button>
        </Link>
      </div>

      <ProjectsTable
        projects={(result.data as any) || []}
        totalPages={result.totalPages || 1}
        currentPage={result.currentPage || 1}
        totalCount={result.total || 0}
        searchTerm={search}
      />
    </div>
  );
}
