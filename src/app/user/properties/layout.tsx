"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  modalDelete: ReactNode;
}

const PropertiesLayout = ({ children, modalDelete }: Props) => {
  const router = useRouter();

  return (
    <div>
      <div className="bg-primary-400 flex justify-between items-center px-4 py-2">
        <h2 className="text-white text-xl font-semibold px-2">İlanlarım</h2>
        <Button
          color="secondary"
          className="bg-blue-950 text-white"
          onPress={() => router.push("/user/properties/add")}
        >
          İlan Ekle
        </Button>
      </div>
      {children}
      <div>{modalDelete}</div>
    </div>
  );
};

export default PropertiesLayout;
