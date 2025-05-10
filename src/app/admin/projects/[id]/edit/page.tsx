import { prisma } from "@/lib/prisma";
import ProjectForm from "../../_components/ProjectForm";
import { notFound, redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  if (!user || role !== "site-admin") {
    redirect("/");
  }

  const project = await prisma.project.findUnique({
    where: { id: Number(params.id) },
    include: {
      location: true,
      office: true,
      unitSizes: true,
      socialFeatures: true,
      images: true,
    },
  });

  if (!project) {
    notFound();
  }

  const offices = await prisma.office.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const agents = await prisma.officeWorker.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      officeId: true,
      role: true,
    },
  });

  const countries = await prisma.country.findMany({
    select: {
      country_name: true,
    },
  });

  const cities = await prisma.city.findMany({
    select: {
      city_name: true,
    },
  });

  const citiesObj = await prisma.country
    .findMany({
      select: {
        country_name: true,
        cities: {
          select: {
            city_name: true,
          },
        },
      },
    })
    .then((countries) =>
      countries.reduce(
        (acc, country) => ({
          ...acc,
          [country.country_name]: country.cities.map((city) => city.city_name),
        }),
        {}
      )
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Projeyi Düzenle</h1>
      <ProjectForm
        project={project}
        offices={offices}
        agents={agents}
        countries={countries}
        cities={cities}
        citiesObj={citiesObj}
      />
    </div>
  );
}
