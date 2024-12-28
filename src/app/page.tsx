import prisma from "@/lib/prisma";
import Image from "next/image";
import PropertyCard from "./components/PropertyCard";
import PropertyContainer from "./components/PropertyContainer";
import Search from "./components/Search";

export default async function Home() {
  return (
    <div>
      <ul>
        <li>İlan Yönetimi</li>
      </ul>
    </div>
  );
}
