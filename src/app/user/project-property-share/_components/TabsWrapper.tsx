"use client";

import { Tabs, Tab } from "@nextui-org/react";
import PropertyShare from "./PropertyShare";
import ProjectShare from "./ProjectShare";
import { Prisma } from "@prisma/client";

interface TabsWrapperProps {
  user: {
    id: string;
    officeWorkerId: number;
    slug: string;
  };
  initialData?: {
    projects: {
      id: number;
      name: string;
      description: string;
      catalogUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      location: {
        city: string;
        district: string;
        neighborhood: string;
      } | null;
    }[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
    searchTerm: string;
  };
}

export default function TabsWrapper({ user, initialData }: TabsWrapperProps) {
  return (
    <Tabs defaultSelectedKey="properties" className="mb-8">
      <Tab key="properties" title="Emlaklar">
        <PropertyShare user={user} />
      </Tab>
      <Tab key="projects" title="Projeler">
        <ProjectShare user={user} initialData={initialData} />
      </Tab>
    </Tabs>
  );
}
