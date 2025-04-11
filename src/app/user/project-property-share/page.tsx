import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TabsWrapper from "./_components/TabsWrapper";

export default async function ProjectPropertySharePage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İlan Paylaş</h1>
      <TabsWrapper
        user={{
          id: dbUser.id,
          officeWorkerId: dbUser.officeWorker?.id || 0,
          slug: dbUser.officeWorker?.slug || "",
        }}
      />
    </div>
  );
}
