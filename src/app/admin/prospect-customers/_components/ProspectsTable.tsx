"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { formatDate } from "@/lib/utils";
import { deleteProspect } from "@/lib/actions/prospect";
import { toast } from "react-toastify";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import ProspectDetailsModal from "@/app/admin/prospect-customers/_components/ProspectDetailsModal";

interface Prospect {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  streetAddress: string;
  contractType: string;
  propertyType: string;
  notes: string;
  kvkkConsent: number;
  marketingConsent: number;
  createdAt: Date;
}

export default function ProspectsTable({
  prospects,
}: {
  prospects: Prospect[];
}) {
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );

  const handleDelete = async (id: number) => {
    if (confirm("Bu müşteri adayını silmek istediğinizden emin misiniz?")) {
      try {
        await deleteProspect(id);
        toast.success("Müşteri adayı başarıyla silindi!");
        window.location.reload();
      } catch (error) {
        toast.error("Müşteri adayı silinirken bir hata oluştu");
      }
    }
  };

  return (
    <>
      <Table aria-label="Müşteri Adayları Tablosu">
        <TableHeader>
          <TableColumn>AD SOYAD</TableColumn>
          <TableColumn>İLETİŞİM</TableColumn>
          <TableColumn>KONUM</TableColumn>
          <TableColumn>TERCİHLER</TableColumn>
          <TableColumn>TARİH</TableColumn>
          <TableColumn>İŞLEMLER</TableColumn>
        </TableHeader>
        <TableBody>
          {prospects.map((prospect) => (
            <TableRow key={prospect.id}>
              <TableCell>{`${prospect.firstName} ${prospect.lastName}`}</TableCell>
              <TableCell>
                <div>
                  <div>{prospect.email}</div>
                  <div>{prospect.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div>{prospect.city}</div>
                  <div>{prospect.district}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div>{prospect.propertyType}</div>
                  <div>{prospect.contractType}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(prospect.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Detayları Görüntüle">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => setSelectedProspect(prospect)}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Sil">
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="light"
                      onClick={() => handleDelete(prospect.id)}
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

      <ProspectDetailsModal
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
      />
    </>
  );
}
