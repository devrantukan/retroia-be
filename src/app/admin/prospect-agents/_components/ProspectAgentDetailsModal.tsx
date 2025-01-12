"use client";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { formatDate } from "@/lib/utils";

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

interface Props {
  agent: ProspectAgent | null;
  onClose: () => void;
}

export default function ProspectAgentDetailsModal({ agent, onClose }: Props) {
  return (
    <Modal isOpen={!!agent} onClose={onClose}>
      <ModalContent>
        {agent && (
          <>
            <ModalHeader>Prospect Agent Details</ModalHeader>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Personal Information</h3>
                  <p>
                    Name: {agent.firstName} {agent.lastName}
                  </p>
                  <p>Email: {agent.email}</p>
                  <p>Phone: {agent.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>City: {agent.city}</p>
                  <p>District: {agent.district}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Professional Background</h3>
                  <p>Education: {agent.educationLevel}</p>
                  <p>Occupation: {agent.occupation}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Consents</h3>
                  <p>KVKK: {agent.kvkkConsent ? "Yes" : "No"}</p>
                  <p>Marketing: {agent.marketingConsent ? "Yes" : "No"}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Created: {formatDate(agent.createdAt)}
              </p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
