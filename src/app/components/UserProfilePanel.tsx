"use client";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import {
  Dropdown,
  DropdownTrigger,
  User,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
} from "@nextui-org/react";
import { User as PrismaUser } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

interface Props {
  user: PrismaUser;
  role?: string | null;
}

const UserProfilePanel = ({ user, role = null }: Props) => {
  const router = useRouter();
  const isAdmin = role === "site-admin";

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          src={user.avatarUrl ?? "/profile.png"}
          size="sm"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" href="/user/profile">
          <Link href="/user/profile">Profil</Link>
        </DropdownItem>
        <DropdownItem key="properties" href="/user/properties">
          <Link className="w-full" href="/user/properties">
            İlan Listesi
          </Link>
        </DropdownItem>
        {isAdmin ? (
          <>
            <DropdownItem key="admin-offices">
              <Link href="/admin/offices" className="w-full">
                Ofisler
              </Link>
            </DropdownItem>

            <DropdownItem
              key="admin-office-workers"
              href="/admin/office-workers"
            >
              <Link href="/admin/office-workers">Ofis Çalışanları</Link>
            </DropdownItem>
            <DropdownItem
              key="admin-prospect-agents"
              href="/admin/prospect-agents"
            >
              <Link href="/admin/prospect-agents">Danışman Adayları</Link>
            </DropdownItem>
            <DropdownItem
              key="admin-prospect-customers"
              href="/admin/prospect-customers"
            >
              <Link href="/admin/prospect-customers">Müşteri Adayları</Link>
            </DropdownItem>
            <DropdownItem
              key="admin-office-worker-reviews"
              href="/admin/office-worker-reviews"
            >
              <Link href="/admin/office-worker-reviews">Yorumlar</Link>
            </DropdownItem>
            <DropdownItem
              key="admin-property-descriptors"
              href="/admin/property-descriptors"
            >
              <Link href="/admin/property-descriptors">
                Özellik Tanımlayıcıları
              </Link>
            </DropdownItem>
          </>
        ) : null}
        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger p-0 h-full"
        >
          <div className="w-full h-full">
            <LogoutLink postLogoutRedirectURL="/">
              <div className="w-full h-full px-2 py-2 inline-flex items-center text-danger cursor-pointer">
                Çıkış Yap
              </div>
            </LogoutLink>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
export default UserProfilePanel;
