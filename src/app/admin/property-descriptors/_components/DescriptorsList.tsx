"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@nextui-org/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import {
  PropertyDescriptor,
  PropertyDescriptorCategory,
  PropertyType,
} from "@prisma/client";
import { EditIcon, DeleteIcon } from "@nextui-org/shared-icons";
import AddCategoryModal from "./AddCategoryModal";
import AddDescriptorModal from "./AddDescriptorModal";
import EditCategoryModal from "./EditCategoryModal";
import EditDescriptorModal from "./EditDescriptorModal";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import {
  deleteCategory,
  deleteDescriptor,
} from "@/lib/actions/property-descriptor";
import { useRouter } from "next/navigation";

interface Props {
  initialCategories: (PropertyDescriptorCategory & {
    type: { id: number; value: string };
  })[];
  initialDescriptors: (PropertyDescriptor & {
    category: PropertyDescriptorCategory;
  })[];
  propertyTypes: PropertyType[];
}

export default function DescriptorsList({
  initialCategories,
  initialDescriptors,
  propertyTypes,
}: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [descriptors, setDescriptors] = useState(initialDescriptors);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddDescriptor, setShowAddDescriptor] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<PropertyDescriptorCategory | null>(null);
  const [editingDescriptor, setEditingDescriptor] =
    useState<PropertyDescriptor | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<number | null>(null);
  const [deletingDescriptor, setDeletingDescriptor] = useState<number | null>(
    null
  );
  const router = useRouter();

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Kategori başarıyla silindi", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Kategori silinirken bir hata oluştu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDeleteDescriptor = async (id: number) => {
    try {
      await deleteDescriptor(id);
      setDescriptors(descriptors.filter((d) => d.id !== id));
      toast.success("Tanımlayıcı başarıyla silindi", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Tanımlayıcı silinirken bir hata oluştu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCategorySuccess = (newCategory: any) => {
    setCategories((prev) => [...prev, newCategory]);
    router.refresh();
  };

  const handleDescriptorSuccess = (newDescriptor: any) => {
    setDescriptors((prev) => [...prev, newDescriptor]);
    router.refresh();
  };

  const handleCategoryEdit = (updatedCategory: any) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    router.refresh();
  };

  const handleDescriptorEdit = (updatedDescriptor: any) => {
    setDescriptors((prev) =>
      prev.map((desc) =>
        desc.id === updatedDescriptor.id ? updatedDescriptor : desc
      )
    );
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex gap-4">
          <Button color="primary" onPress={() => setShowAddCategory(true)}>
            Yeni Kategori Ekle
          </Button>
          <Button color="primary" onPress={() => setShowAddDescriptor(true)}>
            Yeni Tanımlayıcı Ekle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Table */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Kategoriler</h2>
            <Table aria-label="Kategoriler">
              <TableHeader>
                <TableColumn>Ad</TableColumn>
                <TableColumn>Slug</TableColumn>
                <TableColumn>Mülk Tipi</TableColumn>
                <TableColumn>İşlemler</TableColumn>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.value}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.type?.value || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => setEditingCategory(category)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => setDeletingCategory(category.id)}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Descriptors Table */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Tanımlayıcılar</h2>
            <Table aria-label="Tanımlayıcılar">
              <TableHeader>
                <TableColumn>Ad</TableColumn>
                <TableColumn>Slug</TableColumn>
                <TableColumn>Kategori</TableColumn>
                <TableColumn>İşlemler</TableColumn>
              </TableHeader>
              <TableBody>
                {descriptors.map((descriptor) => (
                  <TableRow key={descriptor.id}>
                    <TableCell>{descriptor.value}</TableCell>
                    <TableCell>{descriptor.slug}</TableCell>
                    <TableCell>{descriptor.category?.value || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => setEditingDescriptor(descriptor)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => setDeletingDescriptor(descriptor.id)}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modals */}
        <AddCategoryModal
          open={showAddCategory}
          onClose={() => setShowAddCategory(false)}
          propertyTypes={propertyTypes}
          onSuccess={handleCategorySuccess}
        />
        <AddDescriptorModal
          open={showAddDescriptor}
          onClose={() => setShowAddDescriptor(false)}
          categories={categories}
          onSuccess={handleDescriptorSuccess}
        />
        {editingCategory && (
          <EditCategoryModal
            category={editingCategory}
            propertyTypes={propertyTypes}
            onClose={() => setEditingCategory(null)}
            onSuccess={handleCategoryEdit}
          />
        )}
        {editingDescriptor && (
          <EditDescriptorModal
            descriptor={editingDescriptor}
            categories={categories}
            onClose={() => setEditingDescriptor(null)}
            onSuccess={handleDescriptorEdit}
          />
        )}

        {/* Delete Confirmation Modals */}
        <Modal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
        >
          <ModalContent>
            <ModalHeader>Kategoriyi Sil</ModalHeader>
            <ModalBody>
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setDeletingCategory(null)}>
                İptal
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  if (deletingCategory) handleDeleteCategory(deletingCategory);
                  setDeletingCategory(null);
                }}
              >
                Sil
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={!!deletingDescriptor}
          onClose={() => setDeletingDescriptor(null)}
        >
          <ModalContent>
            <ModalHeader>Tanımlayıcıyı Sil</ModalHeader>
            <ModalBody>
              Bu tanımlayıcıyı silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => setDeletingDescriptor(null)}
              >
                İptal
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  if (deletingDescriptor)
                    handleDeleteDescriptor(deletingDescriptor);
                  setDeletingDescriptor(null);
                }}
              >
                Sil
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
      <ToastContainer />
    </>
  );
}
