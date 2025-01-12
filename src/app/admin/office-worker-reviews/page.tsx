import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewsTable from "./_components/ReviewsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danışman Değerlendirmeleri | Admin Paneli",
  description: "Danışman değerlendirmeleri yönetim sayfası",
};

export default async function DanismanDegerlendirmeleriPage() {
  const { getUser, getAccessToken } = getKindeServerSession();
  const user = await getUser();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "site-admin") {
    redirect("/");
  }

  const reviews = await prisma.officeWorkerReview.findMany({
    include: {
      officeWorker: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedReviews = reviews.map((review) => ({
    ...review,
    officeWorker: {
      id: review.officeWorker.id,
      firstName: review.officeWorker.name,
      lastName: review.officeWorker.surname,
    },
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danışman Değerlendirmeleri</h1>
      </div>
      <div className="card">
        <ReviewsTable reviews={formattedReviews} />
      </div>
    </div>
  );
}
