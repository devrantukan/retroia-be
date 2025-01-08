import prisma from "@/lib/prisma";
import Image from "next/image";
import PropertyCard from "./components/PropertyCard";
import PropertyContainer from "./components/PropertyContainer";
import Search from "./components/Search";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { redirect, useRouter } from "next/navigation";

export default async function Home() {
  const { getUser } = await getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("api/auth/login");
  } else {
    redirect("/user/properties");
  }

  return (
    <div>
      <ul>
        <li>İlan Yönetimi</li>
      </ul>
    </div>
  );
}
