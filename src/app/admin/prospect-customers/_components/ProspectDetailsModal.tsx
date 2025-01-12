"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { formatDate } from "@/lib/utils";

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

interface Props {
  prospect: Prospect | null;
  onClose: () => void;
}

export default function ProspectDetailsModal({ prospect, onClose }: Props) {
  if (!prospect) return null;

  return (
    <Modal isOpen={!!prospect} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Müşteri Adayı Detayları</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Kişisel Bilgiler</h3>
              <p>
                <span className="font-medium">Ad Soyad:</span>{" "}
                {prospect.firstName} {prospect.lastName}
              </p>
              <p>
                <span className="font-medium">E-posta:</span> {prospect.email}
              </p>
              <p>
                <span className="font-medium">Telefon:</span> {prospect.phone}
              </p>
              <p>
                <span className="font-medium">Kayıt Tarihi:</span>{" "}
                {formatDate(prospect.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adres Bilgileri</h3>
              <p>
                <span className="font-medium">Şehir:</span> {prospect.city}
              </p>
              <p>
                <span className="font-medium">İlçe:</span> {prospect.district}
              </p>
              <p>
                <span className="font-medium">Adres:</span>{" "}
                {prospect.streetAddress}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Gayrimenkul Tercihleri</h3>
              <p>
                <span className="font-medium">İşlem Türü:</span>{" "}
                {prospect.contractType}
              </p>
              <p>
                <span className="font-medium">Emlak Türü:</span>{" "}
                {prospect.propertyType}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">İzinler</h3>
              <p>
                <span className="font-medium">KVKK İzni:</span>{" "}
                {prospect.kvkkConsent ? "Evet" : "Hayır"}
              </p>
              <p>
                <span className="font-medium">Pazarlama İzni:</span>{" "}
                {prospect.marketingConsent ? "Evet" : "Hayır"}
              </p>
            </div>
          </div>
          {prospect.notes && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Notlar</h3>
              <p>{prospect.notes}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Kapat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
