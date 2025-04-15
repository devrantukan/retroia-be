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
} from "@nextui-org/react";
import { formatDate } from "@/lib/utils";
import { deleteProspectAgent } from "@/lib/actions/prospect-agent";
import { toast } from "react-toastify";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import ProspectAgentDetailsModal from "./ProspectAgentDetailsModal";
import { useRouter } from "next/navigation";

interface ProspectAgent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  educationLevel: string;
  occupation: string;
  kvkkConsent: number;
  marketingConsent: number;
  createdAt: Date;
}

export default function ProspectAgentsTable({
  prospectAgents,
}: {
  prospectAgents: ProspectAgent[];
}) {
  const [selectedAgent, setSelectedAgent] = useState<ProspectAgent | null>(
    null
  );
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm("Bu danışman adayını silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/prospect-agents/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete prospect agent");
        }

        toast.success("Danışman adayı başarıyla silindi!");
        router.refresh();
      } catch (error) {
        console.error("Error deleting prospect agent:", error);
        toast.error("Danışman adayı silinirken bir hata oluştu");
      }
    }
  };

  return (
    <>
      <Table aria-label="Danışman Adayları Tablosu">
        <TableHeader>
          <TableColumn>AD SOYAD</TableColumn>
          <TableColumn>İLETİŞİM</TableColumn>
          <TableColumn>KONUM</TableColumn>
          <TableColumn>ARKA PLAN</TableColumn>
          <TableColumn>TARİH</TableColumn>
          <TableColumn>İŞLEMLER</TableColumn>
        </TableHeader>
        <TableBody>
          {prospectAgents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{`${agent.firstName} ${agent.lastName}`}</TableCell>
              <TableCell>
                <div>
                  <div>{agent.email}</div>
                  <div>{agent.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div>{agent.city}</div>
                  <div>{agent.district}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div>{agent.educationLevel}</div>
                  <div>{agent.occupation}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(agent.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Detayları Görüntüle">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => setSelectedAgent(agent)}
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
                      onClick={() => handleDelete(agent.id)}
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

      <ProspectAgentDetailsModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </>
  );
}
