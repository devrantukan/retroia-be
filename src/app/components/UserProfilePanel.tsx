"use client";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import {
  Dropdown,
  DropdownTrigger,
  User,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { User as PrismaUser } from "@prisma/client";
import Link from "next/link";
import React from "react";

interface Props {
  user: PrismaUser;
  role?: string | null;
}

const UserProfilePanel = ({ user, role = null }: Props) => {
  console.log(role);
  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <User
          as="button"
          avatarProps={{
            isBordered: true,
            src: user.avatarUrl ?? "/profile.png",
          }}
          className="transition-transform"
          name={`${user.firstName} ${user.lastName}`}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User Actions" variant="flat">
        <DropdownItem key="profile" href="/user/profile">
          <Link href="/user/profile">Profil</Link>
        </DropdownItem>
        <DropdownItem key="properties" href="/user/properties">
          <Link className="w-full" href="/user/properties">
            İlan Listesi
          </Link>
        </DropdownItem>
        {role === "site-admin" ? (
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
          </>
        ) : null}
        <DropdownItem key="logout" color="danger">
          <LogoutLink>Çıkış</LogoutLink>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
export default UserProfilePanel;
