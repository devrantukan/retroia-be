"use client";

import { Tabs, Tab } from "@nextui-org/react";
import PropertyShare from "./PropertyShare";
import ProjectShare from "./ProjectShare";

interface TabsWrapperProps {
  user: {
    id: string;
    officeWorkerId: number;
    slug: string;
  };
}

export default function TabsWrapper({ user }: TabsWrapperProps) {
  return (
    <Tabs defaultSelectedKey="properties" className="mb-8">
      <Tab key="properties" title="Emlaklar">
        <PropertyShare user={user} />
      </Tab>
      <Tab key="projects" title="Projeler">
        <ProjectShare user={user} />
      </Tab>
    </Tabs>
  );
}
