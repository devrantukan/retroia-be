"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteOfficeWorker } from "@/lib/actions/office-worker";
import { toast } from "sonner";

type OfficeWorker = {
  id: number;
  name: string;
  surname: string;
  email: string;
  office: { name: string };
  role: { name: string };
};

export function OfficeWorkerList() {
  const [workers, setWorkers] = useState<OfficeWorker[]>([]);

  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/admin/office-workers");
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error fetching workers:", errorText);
        throw new Error(errorText);
      }
      const data = await res.json();
      setWorkers(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Çalışanlar yüklenirken bir hata oluştu");
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) {
      try {
        await deleteOfficeWorker(id);
        toast.success("Çalışan başarıyla silindi");
        fetchWorkers();
      } catch (error) {
        toast.error("Bir hata oluştu");
      }
    }
  };

  const columns = [
    { name: "AD SOYAD", uid: "fullName" },
    { name: "E-POSTA", uid: "email" },
    { name: "OFİS", uid: "office" },
    { name: "ROL", uid: "role" },
    { name: "İŞLEMLER", uid: "actions" },
  ];

  return (
    <Table aria-label="Çalışanlar listesi">
      <TableHeader>
        {columns.map((column) => (
          <TableColumn key={column.uid}>{column.name}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {workers?.map((worker) => (
          <TableRow key={worker.id}>
            <TableCell>{`${worker.name} ${worker.surname}`}</TableCell>
            <TableCell>{worker.email}</TableCell>
            <TableCell>{worker.office.name}</TableCell>
            <TableCell>{worker.role.name}</TableCell>
            <TableCell className="space-x-2">
              <Link href={`/admin/office-workers/edit/${worker.id}`}>
                <Button variant="outline" size="sm">
                  Düzenle
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(worker.id)}
              >
                Sil
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
