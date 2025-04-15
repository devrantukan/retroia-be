"use client";
import { useState, useCallback, useEffect } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { useDisclosure } from "@nextui-org/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CountryTable from "./_components/CountryTable";
import CityTable from "./_components/CityTable";
import DistrictTable from "./_components/DistrictTable";
import NeighborhoodTable from "./_components/NeighborhoodTable";
import LocationModal from "./_components/LocationModal";

export default function LocationManagement() {
  const [selectedTab, setSelectedTab] = useState("countries");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [allDistricts, setAllDistricts] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/locations/${selectedTab}?page=${page}&per_page=${rowsPerPage}`
      );
      const result = await response.json();

      switch (selectedTab) {
        case "countries":
          setCountries(result.items);
          break;
        case "cities":
          setCities(result.items);
          break;
        case "districts":
          setDistricts(result.items);
          break;
        case "neighborhoods":
          setNeighborhoods(result.items);
          break;
      }
      setTotal(result.total);
    } catch (error) {
      toast.error("Veri yüklenirken bir hata oluştu");
    }
  }, [selectedTab, page, rowsPerPage]);

  const fetchAllDistricts = useCallback(async () => {
    try {
      const response = await fetch(`/api/locations/districts?per_page=1000`);
      const result = await response.json();
      setAllDistricts(result.items);
    } catch (error) {
      toast.error("İlçeler yüklenirken bir hata oluştu");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedTab === "neighborhoods") {
      fetchAllDistricts();
    }
  }, [selectedTab, fetchAllDistricts]);

  const handleAdd = () => {
    setEditingItem(null);
    onOpen();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`/api/locations/${selectedTab}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Kayıt başarıyla silindi");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const renderTable = () => {
    const commonProps = {
      onAdd: handleAdd,
      onEdit: handleEdit,
      onDelete: handleDelete,
      page,
      total,
      rowsPerPage,
      onPageChange,
      onRowsPerPageChange,
    };

    switch (selectedTab) {
      case "countries":
        return <CountryTable {...commonProps} data={countries} />;
      case "cities":
        return <CityTable {...commonProps} data={cities} />;
      case "districts":
        return <DistrictTable {...commonProps} data={districts} />;
      case "neighborhoods":
        return <NeighborhoodTable {...commonProps} data={neighborhoods} />;
      default:
        return null;
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/locations/cities");
      const data = await response.json();
      setCities(data.items || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Şehirler yüklenirken hata oluştu");
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Konum Yönetimi</h1>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => {
          setSelectedTab(key.toString());
          setPage(1);
          onClose();
          setEditingItem(null);
        }}
      >
        <Tab key="countries" title="Ülkeler">
          {renderTable()}
        </Tab>
        <Tab key="cities" title="Şehirler">
          {renderTable()}
        </Tab>
        <Tab key="districts" title="İlçeler">
          {renderTable()}
        </Tab>
        <Tab key="neighborhoods" title="Mahalleler">
          {renderTable()}
        </Tab>
      </Tabs>

      <LocationModal
        isOpen={isOpen}
        onClose={onClose}
        type={selectedTab}
        item={editingItem}
        onSuccess={() => {
          onClose();
          fetchData();
        }}
        countries={countries}
        cities={cities}
        districts={allDistricts}
      />
    </div>
  );
}
