import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TabsWrapper from "./_components/TabsWrapper";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 10;

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProjectPropertySharePage({
  searchParams,
}: Props) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      officeWorker: true,
    },
  });

  if (!dbUser) {
    redirect("/api/auth/login");
  }

  const search = (searchParams.search as string) || "";
  const pagenum = +(searchParams.pagenum ?? 1) - 1;

  // Get the agent's ID from the OfficeWorker table
  const agent = await prisma.officeWorker.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!agent) {
    redirect("/unauthorized");
  }

  // Build where clause for search and assigned agents
  const where: Prisma.ProjectWhereInput = {
    AND: [
      {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      },
      {
        OR: [
          { assignedAgents: { contains: agent.id.toString() } },
          { assignedAgents: { startsWith: `${agent.id},` } },
          { assignedAgents: { endsWith: `,${agent.id}` } },
          { assignedAgents: { contains: `,${agent.id},` } },
          { assignedAgents: { equals: agent.id.toString() } },
        ],
      },
      {
        publishingStatus: "PUBLISHED",
      },
    ],
  };

  // Get total count with search filter
  const totalProjectsPromise = prisma.project.count({ where });

  const projectsPromise = prisma.project.findMany({
    where,
    include: {
      location: true,
    },
    skip: Math.max(0, pagenum * PAGE_SIZE),
    take: PAGE_SIZE,
    orderBy: {
      createdAt: "desc",
    },
  });

  const [projects, totalProjects] = await Promise.all([
    projectsPromise,
    totalProjectsPromise,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProjects / PAGE_SIZE));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İlan Paylaş</h1>
      <TabsWrapper
        user={{
          id: dbUser.id,
          officeWorkerId: dbUser.officeWorker?.id || 0,
          slug: dbUser.officeWorker?.slug || "",
        }}
        initialData={{
          projects,
          totalPages,
          currentPage: pagenum + 1,
          totalCount: totalProjects,
          searchTerm: search,
        }}
      />
    </div>
  );
}
