"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  DropdownSection,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function UserProfilePanel({
  user,
  role,
}: {
  user: any;
  role?: string | null;
}) {
  const router = useRouter();
  const isAdmin = role === "site-admin";

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          src={user?.picture || ""}
          size="sm"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem
          key="profile"
          onPress={() => router.push("/user/profile")}
        >
          Profil
        </DropdownItem>

        <DropdownItem
          key="properties"
          onPress={() => router.push("/user/properties")}
        >
          İlan Listesi
        </DropdownItem>

        <DropdownItem
          key="project-property-share"
          onPress={() => router.push("/user/project-property-share")}
        >
          Proje ve İlan Paylaşımı
        </DropdownItem>

        {isAdmin ? (
          <DropdownSection title="Admin">
            <DropdownItem
              key="admin-offices"
              onPress={() => router.push("/admin/offices")}
            >
              Ofisler
            </DropdownItem>
            <DropdownItem
              key="admin-office-workers"
              onPress={() => router.push("/admin/office-workers")}
            >
              Ofis Çalışanları
            </DropdownItem>
            <DropdownItem
              key="admin-prospect-agents"
              onPress={() => router.push("/admin/prospect-agents")}
            >
              Danışman Adayları
            </DropdownItem>
            <DropdownItem
              key="admin-prospect-customers"
              onPress={() => router.push("/admin/prospect-customers")}
            >
              Müşteri Adayları
            </DropdownItem>
            <DropdownItem
              key="admin-office-worker-reviews"
              onPress={() => router.push("/admin/office-worker-reviews")}
            >
              Yorumlar
            </DropdownItem>
            <DropdownItem
              key="admin-property-descriptors"
              onPress={() => router.push("/admin/property-descriptors")}
            >
              Özellik Tanımlayıcıları
            </DropdownItem>
            <DropdownItem
              key="admin-contact-forms"
              onPress={() => router.push("/admin/contact-forms")}
            >
              İletişim Formları
            </DropdownItem>
            <DropdownItem
              key="admin-location-management"
              onPress={() => router.push("/admin/location-management")}
            >
              Lokasyon Yönetimi
            </DropdownItem>
            <DropdownItem
              key="admin-projects"
              onPress={() => router.push("/admin/projects")}
            >
              Projeler
            </DropdownItem>
            <DropdownItem
              key="admin-contents"
              onPress={() => router.push("/admin/contents")}
            >
              İçerik Yönetimi
            </DropdownItem>
          </DropdownSection>
        ) : null}

        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger p-2 h-full"
          onPress={() =>
            (window.location.href =
              "/api/auth/logout?post_logout_redirect_url=/")
          }
        >
          Çıkış Yap
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
