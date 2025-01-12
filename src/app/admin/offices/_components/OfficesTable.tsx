"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Tooltip,
  User,
} from "@nextui-org/react";
import { deleteOffice } from "@/lib/actions/office";
import { toast } from "react-toastify";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Office {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: any;
  district: any;
  workers: any[];
  avatarUrl?: string | null;
}

export default function OfficesTable({ offices }: { offices: Office[] }) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm("Bu ofisi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteOffice(id);
        toast.success("Ofis başarıyla silindi!");
        router.refresh();
      } catch (error) {
        toast.error("Ofis silinirken bir hata oluştu");
      }
    }
  };

  return (
    <Table aria-label="Ofisler tablosu">
      <TableHeader>
        <TableColumn>OFİS</TableColumn>
        <TableColumn>İLETİŞİM</TableColumn>
        <TableColumn>KONUM</TableColumn>
        <TableColumn>ÇALIŞAN SAYISI</TableColumn>
        <TableColumn>İŞLEMLER</TableColumn>
      </TableHeader>
      <TableBody>
        {offices.map((office) => (
          <TableRow key={office.id}>
            <TableCell>
              <User
                name={office.name}
                avatarProps={{
                  src: office.avatarUrl || "/placeholder.png",
                  size: "sm",
                }}
              />
            </TableCell>
            <TableCell>
              <div>
                <div>{office.email}</div>
                <div>{office.phone}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div>{office.city.name}</div>
                <div>{office.district.name}</div>
              </div>
            </TableCell>
            <TableCell>{office.workers.length}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Tooltip content="Düzenle">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() =>
                      router.push(`/admin/offices/edit/${office.id}`)
                    }
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>
                <Tooltip content="Sil">
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="light"
                    onClick={() => handleDelete(office.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
