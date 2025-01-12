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
} from "@nextui-org/react";
import { formatDate } from "@/lib/utils";
import { updateContactRequestStatus } from "@/lib/actions/contact-request";
import { toast } from "react-toastify";

export default function ContactRequestsTable({ contactRequests }: any) {
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateContactRequestStatus(id, newStatus);
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Table aria-label="Contact requests table">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>PHONE</TableColumn>
        <TableColumn>MESSAGE</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>DATE</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody>
        {contactRequests.map((request: any) => (
          <TableRow key={request.id}>
            <TableCell>{`${request.firstName} ${request.lastName}`}</TableCell>
            <TableCell>{request.phone}</TableCell>
            <TableCell>{request.message}</TableCell>
            <TableCell>
              <Chip
                color={request.status === "PENDING" ? "warning" : "success"}
              >
                {request.status}
              </Chip>
            </TableCell>
            <TableCell>{formatDate(request.createdAt)}</TableCell>
            <TableCell>
              {request.status === "PENDING" && (
                <Button
                  color="success"
                  size="sm"
                  onClick={() => handleStatusUpdate(request.id, "COMPLETED")}
                >
                  Mark Complete
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
