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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash } from "@phosphor-icons/react";

type OfficeWorker = {
  id: number;
  name: string;
  surname: string;
  email: string;
  office: { name: string };
  role: { title: string };
};

export function OfficeWorkerList() {
  const [workers, setWorkers] = useState<OfficeWorker[]>([]);
  const router = useRouter();

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
    if (confirm("Bu personeli silmek istediğinizden emin misiniz?")) {
      try {
        await deleteOfficeWorker(id);
        toast.success("Personel başarıyla silindi!");
        window.location.reload();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Personel silinirken bir hata oluştu!");
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
            <TableCell>{worker.role.title}</TableCell>
            <TableCell className="space-x-2">
              <Link href={`/admin/office-workers/edit/${worker.id}`}>
                <Button variant="outline" size="sm">
                  <PencilSimple size={16} weight="bold" />
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(worker.id)}
              >
                <Trash size={16} weight="bold" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
