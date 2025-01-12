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
  Switch,
} from "@nextui-org/react";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils";
import ReviewDetailsModal from "./ReviewDetailsModal";
import {
  updateReviewApproval,
  deleteReview,
} from "@/lib/actions/office-worker-review";

interface Review {
  id: number;
  review: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
  score6: number;
  avg: number;
  isApproved: number;
  officeWorker: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}

export default function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleDelete = async (id: number) => {
    if (confirm("Bu değerlendirmeyi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteReview(id);
        toast.success("Değerlendirme başarıyla silindi!");
        window.location.reload();
      } catch (error) {
        toast.error("Değerlendirme silinirken bir hata oluştu");
      }
    }
  };

  const handleApprovalChange = async (id: number, isApproved: number) => {
    try {
      await updateReviewApproval(id, isApproved === 1 ? 0 : 1);
      toast.success("Onay durumu güncellendi!");
      window.location.reload();
    } catch (error) {
      toast.error("Onay durumu güncellenirken bir hata oluştu");
    }
  };

  return (
    <>
      <Table aria-label="Değerlendirmeler Tablosu">
        <TableHeader>
          <TableColumn>DEĞERLENDİRİLEN</TableColumn>
          <TableColumn>DEĞERLENDİREN</TableColumn>
          <TableColumn>ORTALAMA PUAN</TableColumn>
          <TableColumn>TARİH</TableColumn>
          <TableColumn>ONAY DURUMU</TableColumn>
          <TableColumn>İŞLEMLER</TableColumn>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                {`${review.officeWorker.firstName} ${review.officeWorker.lastName}`}
              </TableCell>
              <TableCell>
                <div>
                  <div>{`${review.firstName} ${review.lastName}`}</div>
                  <div className="text-sm text-gray-500">{review.email}</div>
                </div>
              </TableCell>
              <TableCell>{review.avg}/5</TableCell>
              <TableCell>{formatDate(review.createdAt)}</TableCell>
              <TableCell>
                <Switch
                  isSelected={review.isApproved === 1}
                  onValueChange={() =>
                    handleApprovalChange(review.id, review.isApproved)
                  }
                  aria-label="Onay Durumu"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Detayları Görüntüle">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => setSelectedReview(review)}
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
                      onClick={() => handleDelete(review.id)}
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

      {selectedReview && (
        <ReviewDetailsModal
          review={{
            ...selectedReview,
            kvkkConsent: selectedReview.isApproved === 1 ? 1 : 0,
            marketingConsent: selectedReview.isApproved === 1 ? 1 : 0,
          }}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
}
